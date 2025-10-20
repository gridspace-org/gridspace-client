import Booking from '../models/Booking.model.js';
import logger from '../config/logger.js';

/**
 * Check for booking time conflicts using O(log n) compound index queries
 * Prevents double-booking of spaces
 */
export const checkBookingConflicts = async (req, res, next) => {
  try {
    const { spaceId, startTime, endTime } = req.body;
    const bookingId = req.params?.id; // For update operations

    if (!spaceId || !startTime || !endTime) {
      logger.warn('Booking conflict check called with missing required fields', {
        spaceId,
        hasStartTime: !!startTime,
        hasEndTime: !!endTime
      });
      return res.status(400).json({
        success: false,
        message: "Space ID, start time, and end time are required.",
      });
    }

    // Parse and validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      logger.warn('Invalid date format provided for booking', {
        startTime,
        endTime
      });
      return res.status(400).json({
        success: false,
        message: "Invalid date format for start time or end time.",
      });
    }

    if (start >= end) {
      logger.warn('Invalid booking time range provided', {
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });
      return res.status(400).json({
        success: false,
        message: "End time must be after start time.",
      });
    }

    // Prevent past bookings
    if (start < new Date()) {
      logger.warn('Attempt to book in the past', {
        startTime: start.toISOString(),
        currentTime: new Date().toISOString()
      });
      return res.status(400).json({
        success: false,
        message: "Cannot book spaces in the past.",
      });
    }

    // O(log n) query using compound index { spaceId: 1, startTime: 1, endTime: 1 }
    const conflictingBookings = await Booking.find({
      spaceId,
      _id: { $ne: bookingId }, // Exclude current booking for updates
      status: { $in: ['pending', 'confirmed'] }, // Only check active bookings
      $or: [
        // Case 1: New booking starts during existing booking
        { startTime: { $lte: start }, endTime: { $gt: start } },
        // Case 2: New booking ends during existing booking  
        { startTime: { $lt: end }, endTime: { $gte: end } },
        // Case 3: New booking completely contains existing booking
        { startTime: { $gte: start }, endTime: { $lte: end } }
      ]
    });

    if (conflictingBookings.length > 0) {
      logger.warn('Booking conflict detected', {
        spaceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        conflictingBookings: conflictingBookings.length
      });
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked. Please choose a different time.",
        conflicts: conflictingBookings.map(booking => ({
          id: booking._id,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status
        }))
      });
    }

    logger.info('Booking time slot available', {
      spaceId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      bookingId: bookingId || 'new'
    });

    // Attach parsed dates for downstream use
    req.parsedBookingTimes = { start, end };
    next();
    
  } catch (error) {
    logger.error('Booking conflict check failed', {
      error: error.message,
      spaceId: req.body.spaceId,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during booking conflict check.",
      error: error.message,
    });
  }
};

/**
 * Validate booking duration and business rules
 * O(1) time calculations
 */
export const validateBookingTimes = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;
    
    if (!req.parsedBookingTimes) {
      // Parse dates if not already done by conflict check
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        logger.warn('Invalid date format in time validation');
        return res.status(400).json({
          success: false,
          message: "Invalid date format provided.",
        });
      }
      
      req.parsedBookingTimes = { start, end };
    }

    const { start, end } = req.parsedBookingTimes;
    const durationHours = (end - start) / (1000 * 60 * 60);

    // Validate minimum booking duration (1 hour)
    if (durationHours < 1) {
      logger.warn('Booking duration too short', {
        durationHours: durationHours.toFixed(2),
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });
      return res.status(400).json({
        success: false,
        message: "Minimum booking duration is 1 hour.",
      });
    }

    // Validate maximum booking duration (24 hours)
    if (durationHours > 24) {
      logger.warn('Booking duration too long', {
        durationHours: durationHours.toFixed(2),
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });
      return res.status(400).json({
        success: false,
        message: "Maximum booking duration is 24 hours.",
      });
    }

    // Validate reasonable advance booking (e.g., 3 months max)
    const maxAdvanceDays = 90;
    const maxAllowedDate = new Date();
    maxAllowedDate.setDate(maxAllowedDate.getDate() + maxAdvanceDays);
    
    if (start > maxAllowedDate) {
      logger.warn('Booking too far in advance', {
        startTime: start.toISOString(),
        maxAllowedDate: maxAllowedDate.toISOString()
      });
      return res.status(400).json({
        success: false,
        message: `Cannot book more than ${maxAdvanceDays} days in advance.`,
      });
    }

    logger.info('Booking times validated successfully', {
      durationHours: durationHours.toFixed(2),
      startTime: start.toISOString(),
      endTime: end.toISOString()
    });

    // Attach calculated duration for controller use
    req.bookingDuration = durationHours;
    next();
    
  } catch (error) {
    logger.error('Booking time validation failed', {
      error: error.message,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during booking time validation.",
      error: error.message,
    });
  }
};

/**
 * Check if booking can be modified based on its status and timing
 * O(1) status and time checks
 */
export const checkBookingModifiable = async (req, res, next) => {
  try {
    const booking = req.booking; // From previous middleware
    
    if (!booking) {
      logger.warn('Booking modification check called without booking context');
      return res.status(400).json({
        success: false,
        message: "Booking context required.",
      });
    }

    // Check if booking is in a modifiable state
    if (!['pending', 'confirmed'].includes(booking.status)) {
      logger.warn('Attempt to modify non-modifiable booking', {
        bookingId: booking._id,
        currentStatus: booking.status
      });
      return res.status(400).json({
        success: false,
        message: `Cannot modify booking with status: ${booking.status}.`,
      });
    }

    // Check if booking start time is too close (e.g., within 2 hours)
    const timeUntilStart = (booking.startTime - new Date()) / (1000 * 60 * 60);
    const minimumModificationHours = 2;
    
    if (timeUntilStart < minimumModificationHours) {
      logger.warn('Attempt to modify booking too close to start time', {
        bookingId: booking._id,
        hoursUntilStart: timeUntilStart.toFixed(2),
        minimumHours: minimumModificationHours
      });
      return res.status(400).json({
        success: false,
        message: `Cannot modify booking within ${minimumModificationHours} hours of start time.`,
      });
    }

    logger.info('Booking modification allowed', {
      bookingId: booking._id,
      status: booking.status,
      hoursUntilStart: timeUntilStart.toFixed(2)
    });

    next();
    
  } catch (error) {
    logger.error('Booking modification check failed', {
      error: error.message,
      bookingId: req.booking?._id
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during booking modification check.",
      error: error.message,
    });
  }
};

/**
 * Combined middleware for new booking creation
 */
export const validateNewBooking = [
  checkBookingConflicts,
  validateBookingTimes
];