import {
  createBookingService,
  validateBookingData,
} from "../../services/bookings/booking.service.js";
import {
  formatBookingCreationResponse,
  formatBookingErrorResponse,
  formatBookingValidationError,
  formatBookingConflictResponse,
} from "../../utils/dto/booking.dto.js";
import logger from "../../config/logger.js";

/**
 * Create Booking Controller
 *
 * Handles POST /api/v1/bookings
 * Creates a new booking with conflict detection and business rule validation
 */
export const createBooking = async (req, res) => {
  console.error("createBooking controller called");
  console.error("req.body:", JSON.stringify(req.body, null, 2));
  const startTime = Date.now();
  const { _id: userId } = req.user; // Assuming user info is in req.user from auth middleware

  try {
    logger.info("CreateBooking request started", {
      userId,
      body: req.body,
      spaceId: req.body?.spaceId,
    });

    // Validate booking data using service layer validation
    const { isValid, errors } = validateBookingData(req.body);

    if (!isValid) {
      logger.warn("CreateBooking validation failed", {
        userId,
        errors,
      });
      return res.status(400).json(formatBookingValidationError(errors));
    }

    // Prepare booking data with user ID
    const bookingData = {
      ...req.body,
      userId: userId,
    };

    console.error(
      "bookingData before service call:",
      JSON.stringify(bookingData, null, 2)
    );
    console.error(
      "req.body keys:",
      req.body ? Object.keys(req.body) : "req.body is undefined"
    );

    logger.info("About to call createBookingService", {
      bookingData,
      hasSpaceId: !!bookingData.spaceId,
    });

    // Create booking through service layer
    const booking = await createBookingService(bookingData);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info("Booking created successfully", {
      bookingId: booking._id,
      userId,
      spaceId: req.body.spaceId,
      amount: booking.totalAmount,
      responseTime: `${responseTime}ms`,
    });

    // Format and send response using DTO
    const response = formatBookingCreationResponse(booking);
    res.status(201).json(response);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error("Failed to create booking", {
      userId,
      error: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      details: error.details,
      responseTime: `${responseTime}ms`,
    });

    // Handle specific error types
    if (error.statusCode === 409) {
      // Conflict detected - return conflict response format
      return res
        .status(409)
        .json(formatBookingConflictResponse(error.details?.conflicts || []));
    }

    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json(formatBookingErrorResponse(error.message, error.code));
    }

    // Default server error - include actual error in development
    res
      .status(500)
      .json(
        formatBookingErrorResponse(
          process.env.NODE_ENV === "production"
            ? "Internal server error while creating booking"
            : error.message || "Internal server error while creating booking"
        )
      );
  }
};

/**
 * Create Booking with Pre-validation
 *
 * Extended version with additional pre-validation steps
 */
export const createBookingAdvanced = async (req, res) => {
  const startTime = Date.now();
  const { _id: userId } = req.user;
  const {
    spaceId,
    startTime: bookingStartTime,
    endTime: bookingEndTime,
    guestCount,
    specialRequests,
    paymentMethod,
  } = req.body;

  try {
    logger.info("CreateBookingAdvanced request started", {
      userId,
      spaceId,
      bookingStartTime,
      guestCount,
    });

    // Enhanced validation for advanced booking
    const validationErrors = [];

    // Validate space ID
    if (!spaceId) {
      validationErrors.push("Space ID is required");
    }

    // Validate times
    const startTime = new Date(bookingStartTime);
    const endTime = new Date(bookingEndTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      validationErrors.push("Invalid date/time format");
    }

    if (startTime >= endTime) {
      validationErrors.push("End time must be after start time");
    }

    // Check minimum advance booking time (e.g., 1 hour)
    const minAdvanceTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    if (startTime <= minAdvanceTime) {
      validationErrors.push("Booking must be made at least 1 hour in advance");
    }

    // Validate guest count
    if (guestCount && (guestCount < 1 || guestCount > 50)) {
      validationErrors.push("Guest count must be between 1 and 50");
    }

    // Validate special requests length
    if (specialRequests && specialRequests.length > 500) {
      validationErrors.push("Special requests must be 500 characters or less");
    }

    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json(formatBookingValidationError(validationErrors));
    }

    // Prepare booking data
    const bookingData = {
      spaceId,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      guestCount: guestCount || 1,
      specialRequests: specialRequests || "",
      userId,
    };

    // Create booking through service layer
    const booking = await createBookingService(bookingData);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info("Booking created successfully (advanced)", {
      bookingId: booking._id,
      userId,
      spaceId,
      responseTime: `${responseTime}ms`,
    });

    // Format response
    const response = formatBookingCreationResponse(booking);
    res.status(201).json(response);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error("Failed to create booking (advanced)", {
      userId,
      spaceId,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`,
    });

    // Handle specific error types
    if (error.statusCode === 409) {
      return res
        .status(409)
        .json(formatBookingConflictResponse(error.details?.conflicts || []));
    }

    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json(formatBookingErrorResponse(error.message, error.code));
    }

    res
      .status(500)
      .json(
        formatBookingErrorResponse(
          "Internal server error while creating booking"
        )
      );
  }
};

/**
 * Check Booking Availability
 *
 * Handles POST /api/v1/bookings/check-availability
 * Checks if a time slot is available without creating a booking
 */
export const checkBookingAvailability = async (req, res) => {
  const startTime = Date.now();
  const {
    spaceId,
    startTime: bookingStartTime,
    endTime: bookingEndTime,
  } = req.body;

  try {
    logger.info("CheckBookingAvailability request started", {
      spaceId,
      bookingStartTime,
      bookingEndTime,
    });

    // Validate input
    if (!spaceId || !bookingStartTime || !bookingEndTime) {
      return res
        .status(400)
        .json(
          formatBookingErrorResponse(
            "Space ID, start time, and end time are required",
            "MISSING_REQUIRED_FIELDS"
          )
        );
    }

    // Validate time format
    const startTime = new Date(bookingStartTime);
    const endTime = new Date(bookingEndTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res
        .status(400)
        .json(
          formatBookingErrorResponse(
            "Invalid date/time format",
            "INVALID_TIME_FORMAT"
          )
        );
    }

    if (startTime >= endTime) {
      return res
        .status(400)
        .json(
          formatBookingErrorResponse(
            "End time must be after start time",
            "INVALID_TIME_RANGE"
          )
        );
    }

    // Import BookingRepository for availability check
    const { BookingRepository } = await import(
      "../../services/bookings/booking.service.js"
    );

    // Check for conflicts
    const conflicts = await BookingRepository.findConflicts(
      spaceId,
      startTime,
      endTime
    );

    const responseTime = Date.now() - startTime;
    logger.info("Booking availability checked", {
      spaceId,
      available: conflicts.length === 0,
      conflictCount: conflicts.length,
      responseTime: `${responseTime}ms`,
    });

    res.status(200).json({
      success: true,
      message:
        conflicts.length === 0
          ? "Time slot is available"
          : "Time slot is not available",
      data: {
        available: conflicts.length === 0,
        conflicts:
          conflicts.length > 0
            ? conflicts.map((booking) => ({
                _id: booking._id,
                startTime: booking.startTime,
                endTime: booking.endTime,
                status: booking.status,
              }))
            : [],
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error("Failed to check booking availability", {
      spaceId,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`,
    });

    res
      .status(500)
      .json(
        formatBookingErrorResponse(
          "Internal server error while checking availability"
        )
      );
  }
};
