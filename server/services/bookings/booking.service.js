import BookingRepository from "../../repositories/booking.repository.js";
import Space from "../../models/Space.model.js";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";

// Create repository instance
const bookingRepository = new BookingRepository();

const parsePaginationParams = ({ page = 1, limit = 10 }) => ({
  page: Number.parseInt(page, 10) || 1,
  limit: Number.parseInt(limit, 10) || 10,
});

/**
 * Get bookings for a specific user with filtering and pagination
 * @param {Object} params - Query parameters
 * @param {string} params.userId - User ID
 * @param {string} params.status - Status filter
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} User bookings with pagination info
 */
export const getUserBookingsService = async ({
  userId,
  status,
  page,
  limit,
}) => {
  const pagination = parsePaginationParams({ page, limit });

  logger.debug("BookingService.getUserBookings", {
    userId,
    status,
    ...pagination,
  });

  // Prepare filters
  const filters = {};
  if (status) {
    filters.status = status;
  }

  // Prepare options for repository
  const options = {
    page: pagination.page,
    limit: pagination.limit,
    sortBy: "startTime",
    sortOrder: -1, // Most recent first
    populateFields: ["spaceId"],
  };

  try {
    const result = await bookingRepository.findByUserId(
      userId,
      filters,
      options
    );

    // Format bookings for consistent response
    const bookings = result.bookings.map((booking) => ({
      _id: booking._id,
      space: booking.spaceId
        ? {
            _id: booking.spaceId._id || booking.spaceId,
            title: booking.spaceId.title || "Unknown Space",
            location: booking.spaceId.location || "",
            pricePerHour: booking.spaceId.pricePerHour || 0,
          }
        : null,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalAmount: booking.totalAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      guestCount: booking.guestCount,
      isActive: booking.isActive,
      createdAt: booking.createdAt,
      // Business logic flags
      canReschedule: booking.canReschedule || false,
      canCancel: booking.canCancel || false,
    }));

    return {
      bookings,
      pagination: result.pagination,
    };
  } catch (error) {
    logger.error("Failed to get user bookings", {
      userId,
      status,
      error: error.message,
    });
    throw new AppError("Failed to retrieve user bookings", 500);
  }
};

/**
 * Get bookings for spaces owned by a host
 * @param {Object} params - Query parameters
 * @param {string} params.hostId - Host ID
 * @param {string} params.status - Status filter
 * @param {string} params.spaceId - Specific space ID filter
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Host bookings with pagination info
 */
export const getHostBookingsService = async ({
  hostId,
  status,
  spaceId,
  page,
  limit,
}) => {
  const pagination = parsePaginationParams({ page, limit });

  logger.debug("BookingService.getHostBookings", {
    hostId,
    status,
    spaceId,
    ...pagination,
  });

  try {
    // First verify host has access to the space (if specific spaceId provided)
    if (spaceId) {
      const space = await Space.findOne({
        _id: spaceId,
        hostId: hostId,
      }).select("_id");

      if (!space) {
        throw new AppError("Access denied to space bookings", 403);
      }
    }

    // Prepare filters
    const filters = {};
    if (status) {
      filters.status = status;
    }
    if (spaceId) {
      filters.spaceId = spaceId;
    }

    // Prepare options for repository
    const options = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: "startTime",
      sortOrder: -1, // Most recent first
      populateFields: ["userId", "spaceId"],
    };

    const result = await bookingRepository.findByHostId(
      hostId,
      filters,
      options
    );

    // Format bookings for consistent response
    const bookings = result.bookings.map((booking) => ({
      _id: booking._id,
      user: booking.userId
        ? {
            _id: booking.userId._id || booking.userId,
            fullname: booking.userId.fullname || "Unknown User",
            email: booking.userId.email || "",
            profilePic: booking.userId.profilePic || null,
          }
        : null,
      space: booking.spaceId
        ? {
            _id: booking.spaceId._id || booking.spaceId,
            title: booking.spaceId.title || "Unknown Space",
            location: booking.spaceId.location || "",
          }
        : null,
      startTime: booking.startTime,
      endTime: booking.endTime,
      guestCount: booking.guestCount,
      totalAmount: booking.totalAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests || "",
      hostEarnings: booking.hostEarnings || 0,
      isActive: booking.isActive,
      createdAt: booking.createdAt,
    }));

    return {
      bookings,
      pagination: result.pagination,
    };
  } catch (error) {
    logger.error("Failed to get host bookings", {
      hostId,
      status,
      spaceId,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to retrieve host bookings", 500);
  }
};

/**
 * Get a single booking by ID with access validation
 * @param {string} bookingId - Booking ID
 * @param {string} userId - User ID (for access validation)
 * @param {string} role - User role (user/host)
 * @returns {Promise<Object>} Found booking
 */
export const getBookingByIdService = async (bookingId, userId, role) => {
  logger.debug("BookingService.getBookingById", {
    bookingId,
    userId,
    role,
  });

  try {
    // Populate user and space information
    const populateFields = ["userId", "spaceId"];
    let booking = await bookingRepository.findById(bookingId, populateFields);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    // Check access based on user role
    if (role === "user" && booking.userId._id.toString() !== userId) {
      throw new AppError("Access denied to this booking", 403);
    }

    if (role === "host") {
      // For hosts, check if they own the space this booking is for
      const space = await Space.findOne({
        _id: booking.spaceId._id,
        hostId: userId,
      }).select("_id");

      if (!space) {
        throw new AppError("Access denied to this booking", 403);
      }
    }

    return booking;
  } catch (error) {
    logger.error("Failed to get booking by ID", {
      bookingId,
      userId,
      role,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to retrieve booking", 500);
  }
};

/**
 * Create a new booking with conflict detection and business rules
 * @param {Object} bookingData - Booking creation data
 * @returns {Promise<Object>} Created booking
 */
export const createBookingService = async (bookingData) => {
  console.error(
    "createBookingService called with:",
    JSON.stringify(bookingData, null, 2)
  );
  console.error("Type of bookingData:", typeof bookingData);
  console.error(
    "bookingData is null/undefined:",
    bookingData === null || bookingData === undefined
  );

  logger.debug("BookingService.createBooking START", {
    bookingData: bookingData,
    bookingDataType: typeof bookingData,
    bookingDataKeys: bookingData ? Object.keys(bookingData) : null,
    userId: bookingData?.userId,
    spaceId: bookingData?.spaceId,
    startTime: bookingData?.startTime,
    endTime: bookingData?.endTime,
  });

  try {
    if (!bookingData) {
      logger.error("Booking data is undefined or null");
      throw new AppError("Booking data is required", 400);
    }

    console.error(
      "About to destructure bookingData:",
      JSON.stringify(bookingData, null, 2)
    );
    console.error("bookingData has spaceId:", "spaceId" in bookingData);
    console.error("bookingData.spaceId value:", bookingData.spaceId);

    let userId,
      spaceId,
      startTime,
      endTime,
      guestCount,
      specialRequests,
      totalAmount;
    try {
      ({
        userId,
        spaceId,
        startTime,
        endTime,
        guestCount,
        specialRequests,
        totalAmount,
      } = bookingData);
      console.error("Destructuring successful!");
    } catch (err) {
      console.error("Destructuring failed:", err);
      console.error(
        "bookingData at destructuring error:",
        JSON.stringify(bookingData, null, 2)
      );
      throw err;
    }

    // Validate booking data
    if (!userId || !spaceId || !startTime || !endTime) {
      console.error("Validation failed:", { userId, spaceId, startTime, endTime });
      throw new AppError("Missing required booking data", 400);
    }

    console.error("Validation passed, proceeding with date parsing");
    
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    console.error("Dates parsed:", { startDateTime, endDateTime });

    if (startDateTime >= endDateTime) {
      console.error("Start date is after end date");
      throw new AppError("Start time must be before end time", 400);
    }

    console.error("Checking space availability");

    if (startDateTime <= new Date()) {
      throw new AppError("Booking must be for a future time", 400);
    }

    // Check for conflicts
    const conflicts = await bookingRepository.findConflicts(
      spaceId,
      startDateTime,
      endDateTime
    );
    if (conflicts.length > 0) {
      throw new AppError("Time slot conflict detected", 409, {
        conflicts: conflicts.map((c) => ({
          _id: c._id,
          startTime: c.startTime,
          endTime: c.endTime,
          status: c.status,
        })),
      });
    }

    // Validate space exists and is available
    const space = await Space.findById(spaceId);
    if (!space) {
      throw new AppError("Space not found", 404);
    }

    if (!space.isActive) {
      throw new AppError("Space is not available for booking", 400);
    }

    // Validate booking time against space's time slots
    if (space.timeSlots && space.timeSlots.length > 0) {
      const bookingDay = startDateTime.toLocaleLowerCase("en-US", {
        weekday: "long",
      });
      const bookingStartTime = startDateTime.toTimeString().slice(0, 5); // HH:MM format
      const bookingEndTime = endDateTime.toTimeString().slice(0, 5); // HH:MM format

      // Find matching time slot for the booking day
      const matchingSlot = space.timeSlots.find(
        (slot) => slot.day.toLowerCase() === bookingDay
      );

      if (!matchingSlot) {
        throw new AppError(`Space is not available on ${bookingDay}s`, 400, {
          availableDays: space.timeSlots.map((slot) => slot.day),
        });
      }

      // Check if booking time is within the slot's time range
      if (
        bookingStartTime < matchingSlot.startTime ||
        bookingEndTime > matchingSlot.endTime
      ) {
        throw new AppError(
          `Booking time must be within ${matchingSlot.day} ${matchingSlot.startTime}-${matchingSlot.endTime}`,
          400,
          {
            requestedTime: `${bookingStartTime}-${bookingEndTime}`,
            availableTime: `${matchingSlot.startTime}-${matchingSlot.endTime}`,
          }
        );
      }
    }

    // Calculate duration and determine best pricing
    const timeDiffMs = endDateTime - startDateTime;
    const durationHours = timeDiffMs / (1000 * 60 * 60);
    const durationDays = timeDiffMs / (1000 * 60 * 60 * 24);

    // Smart pricing: select best rate based on duration
    let bookingType = bookingData.bookingType || "hourly";
    let basePrice = 0;
    let duration = 0;

    if (!bookingData.bookingType) {
      // Auto-select booking type based on duration
      if (durationDays >= 30 && space.pricePerMonth) {
        bookingType = "monthly";
        duration = Math.ceil(durationDays / 30);
        basePrice = space.pricePerMonth * duration;
      } else if (durationDays >= 7 && space.pricePerWeek) {
        bookingType = "weekly";
        duration = Math.ceil(durationDays / 7);
        basePrice = space.pricePerWeek * duration;
      } else if (durationDays >= 1 && space.pricePerDay) {
        bookingType = "daily";
        duration = Math.ceil(durationDays);
        basePrice = space.pricePerDay * duration;
      } else {
        bookingType = "hourly";
        duration = Math.ceil(durationHours);
        basePrice = space.pricePerHour * duration;
      }
    } else {
      // Use specified booking type
      switch (bookingType) {
        case "monthly":
          if (!space.pricePerMonth)
            throw new AppError(
              "Monthly booking not available for this space",
              400
            );
          duration = Math.ceil(durationDays / 30);
          basePrice = space.pricePerMonth * duration;
          break;
        case "weekly":
          if (!space.pricePerWeek)
            throw new AppError(
              "Weekly booking not available for this space",
              400
            );
          duration = Math.ceil(durationDays / 7);
          basePrice = space.pricePerWeek * duration;
          break;
        case "daily":
          if (!space.pricePerDay)
            throw new AppError(
              "Daily booking not available for this space",
              400
            );
          duration = Math.ceil(durationDays);
          basePrice = space.pricePerDay * duration;
          break;
        case "hourly":
        default:
          duration = Math.ceil(durationHours);
          basePrice = space.pricePerHour * duration;
      }
    }

    const calculatedAmount = totalAmount || basePrice;

    // Create booking data
    const newBooking = {
      userId,
      spaceId,
      startTime: startDateTime,
      endTime: endDateTime,
      bookingType,
      duration,
      basePrice,
      guestCount: guestCount || 1,
      totalAmount: calculatedAmount,
      specialRequests: specialRequests || "",
      status: "pending",
      paymentStatus: "pending",
      isActive: true,
    };

    // Save booking
    const booking = await bookingRepository.create(newBooking);

    logger.info("Booking created successfully", {
      bookingId: booking._id,
      userId,
      spaceId,
      amount: calculatedAmount,
    });

    return booking;
  } catch (error) {
    logger.error("Failed to create booking", {
      userId: bookingData?.userId,
      spaceId: bookingData?.spaceId,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(error.message || "Failed to create booking", 500);
  }
};

/**
 * Update booking status with business rule validation
 * @param {Object} params - Update parameters
 * @returns {Promise<Object>} Updated booking
 */
export const updateBookingStatusService = async ({
  bookingId,
  hostId,
  status,
  hostNotes,
  cancellationReason,
}) => {
  logger.debug("BookingService.updateBookingStatus", {
    bookingId,
    hostId,
    status,
  });

  try {
    // Fetch booking with space and user info
    const populateFields = ["spaceId", "userId"];
    let booking = await bookingRepository.findById(bookingId, populateFields);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    // Verify host owns the space
    if (booking.spaceId.hostId.toString() !== hostId.toString()) {
      throw new AppError("Access denied to this booking", 403);
    }

    // Validate status transition
    const validTransitions = {
      pending: ["confirmed", "upcoming", "cancelled", "rejected"],
      upcoming: ["cancelled"],
      confirmed: ["cancelled"],
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      throw new AppError(
        `Cannot change status from ${booking.status} to ${status}`,
        400
      );
    }

    // Prepare update data
    const updateData = { status, hostNotes };

    // Handle cancellation specifics
    if (status === "cancelled") {
      updateData.cancellationInfo = {
        cancelledAt: new Date(),
        cancelledBy: hostId,
        reason: cancellationReason,
        notes: `Cancelled by host: ${hostNotes || "No reason provided"}`,
      };

      // Auto-refund if already paid
      if (booking.paymentStatus === "paid") {
        updateData.paymentStatus = "refunded";
        updateData.cancellationInfo.refundAmount = booking.totalAmount;
      }
    }

    // Update booking
    const updatedBooking = await bookingRepository.findByIdAndUpdate(
      bookingId,
      updateData,
      ["userId", "spaceId"]
    );

    logger.info("Booking status updated successfully", {
      bookingId,
      oldStatus: booking.status,
      newStatus: status,
    });

    return {
      booking: updatedBooking,
      refundInfo:
        status === "cancelled" && updateData.paymentStatus === "refunded"
          ? {
              amount: booking.totalAmount,
              type: "full",
              message: `Refund of ₦${booking.totalAmount} will be processed to your wallet`,
            }
          : null,
    };
  } catch (error) {
    logger.error("Failed to update booking status", {
      bookingId,
      hostId,
      status,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to update booking status", 500);
  }
};

/**
 * Cancel booking with refund calculation
 * @param {Object} params - Cancellation parameters
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelBookingService = async ({ bookingId, userId }) => {
  logger.debug("BookingService.cancelBooking", {
    bookingId,
    userId,
  });

  try {
    // Fetch and verify booking
    const populateFields = ["userId", "spaceId"];
    let booking = await bookingRepository.findById(bookingId, populateFields);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    // Verify user owns the booking
    if (booking.userId._id.toString() !== userId.toString()) {
      throw new AppError("Access denied to this booking", 403);
    }

    // Validate cancellation eligibility
    if (!booking.canCancel) {
      const hoursUntilStart =
        (booking.startTime - new Date()) / (1000 * 60 * 60);
      throw new AppError(
        "Cannot cancel booking within 2 hours of start time",
        400
      );
    }

    // Calculate refund amount
    const hoursUntilStart = (booking.startTime - new Date()) / (1000 * 60 * 60);
    let refundAmount = 0;
    let refundType = "none";
    let refundMessage = "";

    if (hoursUntilStart > 48) {
      // Full refund for cancellations 48+ hours in advance
      refundAmount = booking.totalAmount;
      refundType = "full";
      refundMessage = `Refund of ₦${refundAmount} will be processed to your wallet`;
    } else if (hoursUntilStart > 2) {
      // 50% refund for cancellations 2-48 hours in advance
      refundAmount = Math.floor(booking.totalAmount * 0.5);
      refundType = "partial";
      refundMessage = `Refund of ₦${refundAmount} will be processed to your wallet`;
    } else {
      // Less than 2 hours - no refund
      refundMessage =
        "No refund available for cancellations within 2 hours of booking time";
    }

    // Prepare cancellation update
    const updateData = {
      status: "cancelled",
      cancellationInfo: {
        cancelledAt: new Date(),
        cancelledBy: userId,
        reason: "user_request",
        refundAmount,
        notes: `Cancelled by user. Refund: ${
          refundAmount > 0 ? "₦" + refundAmount : "None"
        }`,
      },
    };

    if (refundAmount > 0) {
      updateData.paymentStatus =
        refundAmount === booking.totalAmount
          ? "refunded"
          : "partially_refunded";
    }

    // Update booking
    const cancelledBooking = await bookingRepository.findByIdAndUpdate(
      bookingId,
      updateData,
      ["userId", "spaceId"]
    );

    logger.info("Booking cancelled successfully", {
      bookingId,
      userId,
      refundAmount,
      refundType,
    });

    return {
      booking: cancelledBooking,
      refund: {
        amount: refundAmount,
        type: refundType,
        message: refundMessage,
      },
    };
  } catch (error) {
    logger.error("Failed to cancel booking", {
      bookingId,
      userId,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to cancel booking", 500);
  }
};

/**
 * Validate booking creation data
 * @param {Object} bookingData - Booking data to validate
 * @returns {Object} Validation result
 */
export const validateBookingData = (bookingData) => {
  const errors = [];

  if (!bookingData.spaceId) {
    errors.push("Space ID is required");
  }

  if (!bookingData.startTime) {
    errors.push("Start time is required");
  } else {
    const startTime = new Date(bookingData.startTime);
    if (isNaN(startTime.getTime())) {
      errors.push("Invalid start time format");
    } else if (startTime <= new Date()) {
      errors.push("Start time must be in the future");
    }
  }

  if (!bookingData.endTime) {
    errors.push("End time is required");
  } else {
    const endTime = new Date(bookingData.endTime);
    if (isNaN(endTime.getTime())) {
      errors.push("Invalid end time format");
    }
  }

  if (bookingData.startTime && bookingData.endTime) {
    const startTime = new Date(bookingData.startTime);
    const endTime = new Date(bookingData.endTime);
    if (startTime >= endTime) {
      errors.push("End time must be after start time");
    }
  }

  if (
    bookingData.guestCount &&
    (bookingData.guestCount < 1 || bookingData.guestCount > 50)
  ) {
    errors.push("Guest count must be between 1 and 50");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Export the repository instance for use in other service methods
export { bookingRepository };

// Export service methods as default object
const bookingService = {
  getUserBookings: getUserBookingsService,
  getHostBookings: getHostBookingsService,
  getBookingById: getBookingByIdService,
  createBooking: createBookingService,
  updateBookingStatus: updateBookingStatusService,
  cancelBooking: cancelBookingService,
  validateBookingData,
};

export default bookingService;
