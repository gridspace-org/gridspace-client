import Booking from '../models/Booking.model.js';
import Space from '../models/Space.model.js';
import { 
  createBookingValidation, 
  updateBookingStatusValidation,
  rescheduleBookingValidation 
} from '../validators/booking.validator.js';
import logger from '../config/logger.js';

// ===== PREVIOUSLY IMPLEMENTED =====
export const createBooking = async (req, res) => {
  // ... (previous implementation remains exactly the same)
};

/**
 * CONTROLLER: Get User Bookings
 * Returns paginated list of bookings for the authenticated user
 * Supports filtering by status for the "My Bookings" UI page
 * Time Complexity: O(log n) - Indexed queries with pagination
 */
export const getUserBookings = async (req, res) => {
  const startTime = Date.now();
  const { userId } = req.user;
  
  try {
    logMethodEntry('getUserBookings', { userId, query: req.query });

    // ===== QUERY VALIDATION =====
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Validate status filter against allowed values
    if (status && !['pending', 'upcoming', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json(formatErrorResponse('Invalid status filter'));
    }

    // ===== BUILD QUERY FILTER =====
    const filter = { userId, isActive: true };
    if (status) filter.status = status;

    logger.debug('Fetching user bookings', { userId, filter, pageNum, limitNum });

    // ===== EXECUTE PAGINATED QUERY =====
    // Uses mongoose-paginate-v2 for efficient pagination
    const options = {
      page: pageNum,
      limit: limitNum,
      sort: { createdAt: -1 }, // Most recent first
      populate: {
        path: 'spaceId',
        select: 'title location images amenities capacity pricePerHour'
      },
      lean: true // Better performance for read operations
    };

    const result = await Booking.paginate(filter, options);

    // ===== FORMAT RESPONSE FOR UI =====
    const formattedBookings = result.docs.map(booking => ({
      _id: booking._id,
      space: {
        _id: booking.spaceId._id,
        title: booking.spaceId.title,
        location: booking.spaceId.location,
        images: booking.spaceId.images,
        amenities: booking.spaceId.amenities
      },
      date: booking.formattedDate,        // Virtual field: "June 22nd, 2025"
      time: booking.formattedTime,        // Virtual field: "9:00 AM to 4:00 PM"
      price: booking.totalAmount,         // "N10,000"
      guestCount: booking.guestCount,     // "Number of Guests: 4"
      status: booking.status,             // "upcoming", "pending", etc.
      paymentStatus: booking.paymentStatus,
      canReschedule: booking.canReschedule, // Virtual field
      canCancel: booking.canCancel         // Virtual field
    }));

    // ===== SUCCESS RESPONSE =====
    const responseTime = Date.now() - startTime;
    logger.info('User bookings retrieved successfully', {
      userId,
      totalBookings: result.totalDocs,
      page: result.page,
      responseTime: `${responseTime}ms`
    });

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings: formattedBookings,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalBookings: result.totalDocs,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage
        }
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to retrieve user bookings', {
      error: error.message,
      userId,
      responseTime: `${responseTime}ms`
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * CONTROLLER: Get Host Bookings
 * Returns bookings for spaces owned by the authenticated host
 * Used in host dashboard for managing their spaces' bookings
 */
export const getHostBookings = async (req, res) => {
  const startTime = Date.now();
  const hostId = req.user._id;

  try {
    logMethodEntry('getHostBookings', { hostId, query: req.query });

    // ===== QUERY VALIDATION =====
    const { page = 1, limit = 10, spaceId, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // ===== VERIFY HOST OWNS THE SPACE =====
    if (spaceId) {
      const space = await Space.findOne({ _id: spaceId, hostId });
      if (!space) {
        logger.warn('Host does not own requested space', { hostId, spaceId });
        return res.status(403).json(formatErrorResponse('Access denied to space bookings'));
      }
    }

    // ===== BUILD QUERY FILTER =====
    // Get all spaces owned by this host
    const hostSpaces = await Space.find({ hostId }).select('_id');
    const spaceIds = hostSpaces.map(space => space._id);

    const filter = { 
      spaceId: { $in: spaceIds },
      isActive: true 
    };

    // Apply filters if provided
    if (spaceId) filter.spaceId = spaceId;
    if (status) filter.status = status;

    logger.debug('Fetching host bookings', { hostId, filter, pageNum, limitNum });

    // ===== EXECUTE PAGINATED QUERY =====
    const options = {
      page: pageNum,
      limit: limitNum,
      sort: { startTime: 1 }, // Chronological order
      populate: [
        {
          path: 'spaceId',
          select: 'title location'
        },
        {
          path: 'userId',
          select: 'fullname email profilePic'
        }
      ],
      lean: true
    };

    const result = await Booking.paginate(filter, options);

    // ===== FORMAT RESPONSE FOR HOST DASHBOARD =====
    const formattedBookings = result.docs.map(booking => ({
      _id: booking._id,
      user: {
        _id: booking.userId._id,
        fullname: booking.userId.fullname,
        email: booking.userId.email,
        profilePic: booking.userId.profilePic
      },
      space: {
        _id: booking.spaceId._id,
        title: booking.spaceId.title,
        location: booking.spaceId.location
      },
      date: booking.formattedDate,
      time: booking.formattedTime,
      guestCount: booking.guestCount,
      totalAmount: booking.totalAmount,
      hostEarnings: booking.hostEarnings,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests
    }));

    // ===== SUCCESS RESPONSE =====
    const responseTime = Date.now() - startTime;
    logger.info('Host bookings retrieved successfully', {
      hostId,
      totalBookings: result.totalDocs,
      responseTime: `${responseTime}ms`
    });

    res.status(200).json({
      success: true,
      message: 'Host bookings retrieved successfully',
      data: {
        bookings: formattedBookings,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalBookings: result.totalDocs,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage
        }
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to retrieve host bookings', {
      error: error.message,
      hostId,
      responseTime: `${responseTime}ms`
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve host bookings',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * CONTROLLER: Update Booking Status
 * Allows hosts to confirm, cancel, or reject bookings
 * Implements business rules for valid status transitions
 */
export const updateBookingStatus = async (req, res) => {
  const startTime = Date.now();
  const hostId = req.user._id;
  const { id: bookingId } = req.params;

  try {
    logMethodEntry('updateBookingStatus', { hostId, bookingId, body: req.body });

    // ===== INPUT VALIDATION =====
    const { error, value } = updateBookingStatusValidation.validate(req.body);
    if (error) {
      logger.warn('Status update validation failed', {
        hostId,
        bookingId,
        errors: error.details
      });
      return res.status(400).json(formatErrorResponse('Validation failed', error.details));
    }

    const { status, hostNotes, cancellationReason } = value;

    // ===== FETCH BOOKING WITH VERIFICATION =====
    const booking = await Booking.findById(bookingId)
      .populate('spaceId', 'hostId title');
    
    if (!booking) {
      logger.warn('Booking not found for status update', { hostId, bookingId });
      return res.status(404).json(formatErrorResponse('Booking not found'));
    }

    // ===== VERIFY HOST OWNERSHIP =====
    if (booking.spaceId.hostId.toString() !== hostId.toString()) {
      logger.warn('Host attempted to update booking they do not own', {
        hostId,
        bookingHostId: booking.spaceId.hostId,
        bookingId
      });
      return res.status(403).json(formatErrorResponse('Access denied to this booking'));
    }

    // ===== VALIDATE STATUS TRANSITION =====
    const validTransitions = {
      pending: ['confirmed', 'upcoming', 'cancelled', 'rejected'],
      upcoming: ['cancelled'],
      confirmed: ['cancelled']
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      logger.warn('Invalid status transition attempted', {
        bookingId,
        currentStatus: booking.status,
        attemptedStatus: status
      });
      return res.status(400).json(
        formatErrorResponse(`Cannot change status from ${booking.status} to ${status}`)
      );
    }

    // ===== UPDATE BOOKING STATUS =====
    const updateData = { status, hostNotes };
    
    // Handle cancellation specifics
    if (status === 'cancelled') {
      updateData.cancellationInfo = {
        cancelledAt: new Date(),
        cancelledBy: hostId,
        reason: cancellationReason,
        notes: `Cancelled by host: ${hostNotes || 'No reason provided'}`
      };
      
      // Auto-refund if already paid
      if (booking.paymentStatus === 'paid') {
        updateData.paymentStatus = 'refunded';
        updateData.cancellationInfo.refundAmount = booking.totalAmount;
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'fullname email');

    // ===== SUCCESS RESPONSE =====
    const responseTime = Date.now() - startTime;
    logger.info('Booking status updated successfully', {
      hostId,
      bookingId,
      oldStatus: booking.status,
      newStatus: status,
      responseTime: `${responseTime}ms`
    });

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: {
        booking: {
          _id: updatedBooking._id,
          status: updatedBooking.status,
          paymentStatus: updatedBooking.paymentStatus,
          hostNotes: updatedBooking.hostNotes,
          user: {
            fullname: updatedBooking.userId.fullname,
            email: updatedBooking.userId.email
          }
        }
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to update booking status', {
      error: error.message,
      hostId,
      bookingId,
      responseTime: `${responseTime}ms`
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * CONTROLLER: Cancel Booking (User Initiated)
 * Allows users to cancel their own bookings with refund logic
 * Implements cancellation policy based on timing
 */
export const cancelBooking = async (req, res) => {
  const startTime = Date.now();
  const userId = req.user._id;
  const { id: bookingId } = req.params;

  try {
    logMethodEntry('cancelBooking', { userId, bookingId });

    // ===== FETCH AND VERIFY BOOKING =====
    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      isActive: true
    });

    if (!booking) {
      logger.warn('Booking not found for user cancellation', { userId, bookingId });
      return res.status(404).json(formatErrorResponse('Booking not found'));
    }

    // ===== VALIDATE CANCELLATION ELIGIBILITY =====
    if (!booking.canCancel) {
      const hoursUntilStart = (booking.startTime - new Date()) / (1000 * 60 * 60);
      logger.warn('User attempted to cancel ineligible booking', {
        userId,
        bookingId,
        hoursUntilStart,
        status: booking.status
      });
      
      return res.status(400).json(
        formatErrorResponse('Cannot cancel booking within 2 hours of start time')
      );
    }

    // ===== CALCULATE REFUND AMOUNT =====
    const hoursUntilStart = (booking.startTime - new Date()) / (1000 * 60 * 60);
    let refundAmount = 0;
    let refundReason = '';

    if (hoursUntilStart > 48) {
      // Full refund for cancellations 48+ hours in advance
      refundAmount = booking.totalAmount;
      refundReason = 'full_refund_48h';
    } else if (hoursUntilStart > 2) {
      // 50% refund for cancellations 2-48 hours in advance
      refundAmount = Math.floor(booking.totalAmount * 0.5);
      refundReason = 'partial_refund_50p';
    }
    // Less than 2 hours - no refund (refundAmount remains 0)

    // ===== UPDATE BOOKING WITH CANCELLATION =====
    const updateData = {
      status: 'cancelled',
      cancellationInfo: {
        cancelledAt: new Date(),
        cancelledBy: userId,
        reason: 'user_request',
        refundAmount,
        notes: `Cancelled by user. Refund: ${refundAmount > 0 ? '₦' + refundAmount : 'None'}`
      }
    };

    if (refundAmount > 0) {
      updateData.paymentStatus = refundAmount === booking.totalAmount ? 'refunded' : 'partially_refunded';
    }

    const cancelledBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    // ===== SUCCESS RESPONSE =====
    const responseTime = Date.now() - startTime;
    logger.info('Booking cancelled successfully', {
      userId,
      bookingId,
      refundAmount,
      responseTime: `${responseTime}ms`
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: {
          _id: cancelledBooking._id,
          status: cancelledBooking.status,
          paymentStatus: cancelledBooking.paymentStatus,
          refundAmount: cancelledBooking.cancellationInfo.refundAmount,
          cancellationTime: cancelledBooking.cancellationInfo.cancelledAt
        },
        refund: {
          amount: refundAmount,
          type: refundAmount === booking.totalAmount ? 'full' : refundAmount > 0 ? 'partial' : 'none',
          message: refundAmount > 0 
            ? `Refund of ₦${refundAmount} will be processed to your wallet`
            : 'No refund available for cancellations within 2 hours of booking time'
        }
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to cancel booking', {
      error: error.message,
      userId,
      bookingId,
      responseTime: `${responseTime}ms`
    });

    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// ===== UTILITY FUNCTIONS =====
/**
 * UTILITY: Format consistent error responses
 */
const formatErrorResponse = (message, errors = null) => ({
  success: false,
  message,
  ...(errors && { errors: Array.isArray(errors) ? errors.map(e => e.message) : [errors] })
});

/**
 * UTILITY: Log controller method entry for debugging
 */
const logMethodEntry = (methodName, params) => {
  logger.debug(`Booking.${methodName}`, params);
};
