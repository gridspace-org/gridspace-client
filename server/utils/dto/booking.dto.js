/**
 * Booking DTO (Data Transfer Object) Formatters
 * 
 * Provides standardized response formatting for booking endpoints.
 * Ensures consistent API responses across all booking routes.
 */

/**
 * Format individual booking response for user-facing responses
 * @param {Object} booking - Raw booking object from database
 * @returns {Object} Formatted booking object
 */
export const formatBookingResponse = (booking) => {
  if (!booking) return null;

  return {
    _id: booking._id,
    spaceId: booking.spaceId,
    userId: booking.userId,
    startTime: booking.startTime,
    endTime: booking.endTime,
    duration: booking.duration,
    totalAmount: booking.totalAmount,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    isActive: booking.isActive,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    
    // Optional fields that might be populated
    user: booking.userId ? {
      _id: booking.userId._id || booking.userId,
      fullname: booking.userId.fullname,
      email: booking.userId.email
    } : undefined,
    
    space: booking.spaceId ? {
      _id: booking.spaceId._id || booking.spaceId,
      title: booking.spaceId.title,
      location: booking.spaceId.location,
      pricePerHour: booking.spaceId.pricePerHour
    } : undefined,
    
    // Optional cancellation info
    cancellationInfo: booking.cancellationInfo,
    
    // Optional host info
    hostNotes: booking.hostNotes
  };
};

/**
 * Format user bookings list response with pagination
 * @param {Array<Object>} bookings - Array of booking objects
 * @param {Object} pagination - Pagination information
 * @returns {Object} Formatted response object
 */
export const formatUserBookingsResponse = (bookings, pagination) => {
  return {
    success: true,
    message: 'User bookings retrieved successfully',
    data: {
      bookings: bookings.map(formatBookingResponse),
      pagination: {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalBookings: pagination.totalBookings,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
        limit: pagination.limit
      }
    }
  };
};

/**
 * Format host bookings list response with pagination
 * @param {Array<Object>} bookings - Array of booking objects
 * @param {Object} pagination - Pagination information
 * @returns {Object} Formatted response object
 */
export const formatHostBookingsResponse = (bookings, pagination) => {
  return {
    success: true,
    message: 'Host bookings retrieved successfully',
    data: {
      bookings: bookings.map(formatBookingResponse),
      pagination: {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalBookings: pagination.totalBookings,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
        limit: pagination.limit
      }
    }
  };
};

/**
 * Format single booking creation/retrieval response
 * @param {Object} booking - Raw booking object from database
 * @returns {Object} Formatted response object
 */
export const formatSingleBookingResponse = (booking) => {
  return {
    success: true,
    message: 'Booking retrieved successfully',
    data: {
      booking: formatBookingResponse(booking)
    }
  };
};

/**
 * Format booking status update response
 * @param {Object} booking - Updated booking object
 * @param {Object} refundInfo - Optional refund information
 * @returns {Object} Formatted response object
 */
export const formatBookingStatusResponse = (booking, refundInfo = null) => {
  const response = {
    success: true,
    message: `Booking ${booking.status} successfully`,
    data: {
      booking: {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        hostNotes: booking.hostNotes,
        updatedAt: booking.updatedAt,
        
        // Include user info if populated
        user: booking.userId ? {
          fullname: booking.userId.fullname,
          email: booking.userId.email
        } : undefined
      }
    }
  };

  // Include refund info if provided (for cancellations)
  if (refundInfo) {
    response.data.refund = refundInfo;
  }

  return response;
};

/**
 * Format booking cancellation response with refund details
 * @param {Object} booking - Updated booking object with cancellation info
 * @param {Object} refund - Refund calculation object
 * @returns {Object} Formatted response object
 */
export const formatBookingCancellationResponse = (booking, refund) => {
  return {
    success: true,
    message: 'Booking cancelled successfully',
    data: {
      booking: {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        refundAmount: booking.cancellationInfo?.refundAmount || 0,
        cancellationTime: booking.cancellationInfo?.cancelledAt,
        cancellationReason: booking.cancellationInfo?.reason
      },
      refund: {
        amount: refund.amount,
        type: refund.type,
        message: refund.message
      }
    }
  };
};

/**
 * Format booking creation response
 * @param {Object} booking - Newly created booking object
 * @returns {Object} Formatted response object
 */
export const formatBookingCreationResponse = (booking) => {
  return {
    success: true,
    message: 'Booking created successfully',
    data: {
      booking: formatBookingResponse(booking)
    }
  };
};

/**
 * Format error response for booking operations
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} Formatted error response
 */
export const formatBookingErrorResponse = (message, code = 'BOOKING_ERROR', details = null) => {
  const response = {
    success: false,
    message,
    error: {
      code,
      timestamp: new Date().toISOString()
    }
  };

  if (details) {
    response.error.details = details;
  }

  return response;
};

/**
 * Format validation error response
 * @param {Array<string>|string} errors - Validation error messages
 * @returns {Object} Formatted validation error response
 */
export const formatBookingValidationError = (errors) => {
  const errorArray = Array.isArray(errors) ? errors : [errors];
  
  return {
    success: false,
    message: 'Validation failed',
    error: {
      code: 'VALIDATION_ERROR',
      details: errorArray,
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Format conflict response (for booking time conflicts)
 * @param {Array<Object>} conflicts - Array of conflicting bookings
 * @returns {Object} Formatted conflict response
 */
export const formatBookingConflictResponse = (conflicts) => {
  return {
    success: false,
    message: 'Time slot conflict detected',
    error: {
      code: 'BOOKING_CONFLICT',
      details: {
        conflicts: conflicts.map(booking => ({
          _id: booking._id,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status
        })),
        message: 'The requested time slot overlaps with existing bookings'
      },
      timestamp: new Date().toISOString()
    }
  };
};