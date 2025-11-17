import { updateBookingStatusService } from '../../services/bookings/booking.service.js';
import { 
  formatBookingStatusResponse, 
  formatBookingErrorResponse, 
  formatBookingValidationError
} from '../../utils/dto/booking.dto.js';
import logger from '../../config/logger.js';

/**
 * Update Booking Status Controller
 * 
 * Handles PUT /api/v1/bookings/:id/status
 * Allows hosts to update booking status with business rule validation
 */
export const updateBookingStatus = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user; // Assuming user info is in req.user from auth middleware
  const { id: bookingId } = req.params;
  const { status, hostNotes, cancellationReason } = req.body;

  try {
    logger.info('UpdateBookingStatus request started', {
      hostId,
      bookingId,
      newStatus: status
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatBookingErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // Validate required fields
    if (!status) {
      return res.status(400).json(
        formatBookingValidationError('Status is required')
      );
    }

    // Validate status values
    const validStatuses = ['pending', 'confirmed', 'upcoming', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(
        formatBookingValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
      );
    }

    // Validate cancellation reason if cancelling
    if (status === 'cancelled' && !cancellationReason) {
      return res.status(400).json(
        formatBookingValidationError('Cancellation reason is required when cancelling a booking')
      );
    }

    // Validate host notes length
    if (hostNotes && hostNotes.length > 500) {
      return res.status(400).json(
        formatBookingValidationError('Host notes must be 500 characters or less')
      );
    }

    // Update booking status through service layer
    const result = await updateBookingStatusService({
      bookingId,
      hostId,
      status,
      hostNotes,
      cancellationReason
    });

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Booking status updated successfully', {
      hostId,
      bookingId,
      oldStatus: result.booking.status,
      newStatus: status,
      responseTime: `${responseTime}ms`
    });

    // Format and send response using DTO
    const response = formatBookingStatusResponse(result.booking, result.refundInfo);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to update booking status', {
      hostId,
      bookingId,
      status,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    // Determine appropriate error response based on error type
    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatBookingErrorResponse(error.message, error.code)
      );
    }

    // Default server error
    res.status(500).json(
      formatBookingErrorResponse('Internal server error while updating booking status')
    );
  }
};

/**
 * Confirm Booking (Quick Action)
 * 
 * Handles PUT /api/v1/bookings/:id/confirm
 * Quick endpoint to confirm a pending booking
 */
export const confirmBooking = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const { id: bookingId } = req.params;
  const { hostNotes } = req.body;

  try {
    logger.info('ConfirmBooking request started', {
      hostId,
      bookingId
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatBookingErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // Validate host notes length if provided
    if (hostNotes && hostNotes.length > 500) {
      return res.status(400).json(
        formatBookingValidationError('Host notes must be 500 characters or less')
      );
    }

    // Confirm booking through service layer
    const result = await updateBookingStatusService({
      bookingId,
      hostId,
      status: 'confirmed',
      hostNotes
    });

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Booking confirmed successfully', {
      hostId,
      bookingId,
      responseTime: `${responseTime}ms`
    });

    // Format response for confirmation
    const response = {
      success: true,
      message: 'Booking confirmed successfully',
      data: {
        booking: {
          _id: result.booking._id,
          status: result.booking.status,
          hostNotes: result.booking.hostNotes,
          user: result.booking.userId ? {
            fullname: result.booking.userId.fullname,
            email: result.booking.userId.email
          } : null,
          space: result.booking.spaceId ? {
            _id: result.booking.spaceId._id,
            title: result.booking.spaceId.title,
            location: result.booking.spaceId.location
          } : null,
          startTime: result.booking.startTime,
          endTime: result.booking.endTime,
          guestCount: result.booking.guestCount,
          totalAmount: result.booking.totalAmount
        }
      }
    };

    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to confirm booking', {
      hostId,
      bookingId,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatBookingErrorResponse(error.message, error.code)
      );
    }

    res.status(500).json(
      formatBookingErrorResponse('Internal server error while confirming booking')
    );
  }
};

/**
 * Reject Booking (Quick Action)
 * 
 * Handles PUT /api/v1/bookings/:id/reject
 * Quick endpoint to reject a pending booking
 */
export const rejectBooking = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const { id: bookingId } = req.params;
  const { hostNotes } = req.body;

  try {
    logger.info('RejectBooking request started', {
      hostId,
      bookingId
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatBookingErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // Validate host notes length if provided
    if (hostNotes && hostNotes.length > 500) {
      return res.status(400).json(
        formatBookingValidationError('Host notes must be 500 characters or less')
      );
    }

    // Reject booking through service layer
    const result = await updateBookingStatusService({
      bookingId,
      hostId,
      status: 'rejected',
      hostNotes,
      cancellationReason: 'Host rejected the booking'
    });

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Booking rejected successfully', {
      hostId,
      bookingId,
      responseTime: `${responseTime}ms`
    });

    // Format response for rejection
    const response = {
      success: true,
      message: 'Booking rejected successfully',
      data: {
        booking: {
          _id: result.booking._id,
          status: result.booking.status,
          hostNotes: result.booking.hostNotes,
          user: result.booking.userId ? {
            fullname: result.booking.userId.fullname,
            email: result.booking.userId.email
          } : null,
          space: result.booking.spaceId ? {
            _id: result.booking.spaceId._id,
            title: result.booking.spaceId.title
          } : null,
          rejectedAt: result.booking.updatedAt
        }
      }
    };

    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to reject booking', {
      hostId,
      bookingId,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatBookingErrorResponse(error.message, error.code)
      );
    }

    res.status(500).json(
      formatBookingErrorResponse('Internal server error while rejecting booking')
    );
  }
};

/**
 * Get Booking Status History
 * 
 * Handles GET /api/v1/bookings/:id/status-history
 * Returns the status change history for a booking (for hosts)
 */
export const getBookingStatusHistory = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const { id: bookingId } = req.params;

  try {
    logger.info('GetBookingStatusHistory request started', {
      hostId,
      bookingId
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatBookingErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // For now, return a basic status history
    // In a full implementation, you might have a separate status history collection
    // or track changes in a more detailed way
    
    // Get current booking to verify ownership
    const { getBookingByIdService } = await import('../../services/bookings/booking.service.js');
    const booking = await getBookingByIdService(bookingId, hostId, 'host');
    
    if (!booking) {
      return res.status(404).json(
        formatBookingErrorResponse('Booking not found', 'BOOKING_NOT_FOUND')
      );
    }

    // Create a basic status history
    const statusHistory = [
      {
        status: booking.status,
        timestamp: booking.updatedAt,
        changedBy: booking.hostNotes ? 'Host' : 'System',
        notes: booking.hostNotes
      }
    ];

    // If there's cancellation info, add it
    if (booking.cancellationInfo) {
      statusHistory.push({
        status: 'cancelled',
        timestamp: booking.cancellationInfo.cancelledAt,
        changedBy: 'User',
        notes: booking.cancellationInfo.notes,
        refundAmount: booking.cancellationInfo.refundAmount
      });
    }

    const responseTime = Date.now() - startTime;
    logger.info('Booking status history retrieved', {
      hostId,
      bookingId,
      historyEntries: statusHistory.length,
      responseTime: `${responseTime}ms`
    });

    res.status(200).json({
      success: true,
      message: 'Booking status history retrieved successfully',
      data: {
        bookingId: booking._id,
        currentStatus: booking.status,
        history: statusHistory
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to get booking status history', {
      hostId,
      bookingId,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatBookingErrorResponse(error.message, error.code)
      );
    }

    res.status(500).json(
      formatBookingErrorResponse('Internal server error while retrieving status history')
    );
  }
};