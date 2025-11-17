import { cancelBookingService } from '../../services/bookings/booking.service.js';
import { 
  formatBookingCancellationResponse, 
  formatBookingErrorResponse, 
  formatBookingValidationError
} from '../../utils/dto/booking.dto.js';
import logger from '../../config/logger.js';

/**
 * Cancel Booking Controller
 * 
 * Handles DELETE /api/v1/bookings/:id
 * Allows users to cancel their own bookings with refund calculation
 */
export const cancelBooking = async (req, res) => {
  const startTime = Date.now();
  const { _id: userId } = req.user; // Assuming user info is in req.user from auth middleware
  const { id: bookingId } = req.params;
  const { reason } = req.body;

  try {
    logger.info('CancelBooking request started', {
      userId,
      bookingId,
      reason
    });

    // Validate cancellation reason
    if (!reason) {
      return res.status(400).json(
        formatBookingValidationError('Cancellation reason is required')
      );
    }

    // Validate reason length
    if (reason.length > 500) {
      return res.status(400).json(
        formatBookingValidationError('Cancellation reason must be 500 characters or less')
      );
    }

    // Cancel booking through service layer
    const result = await cancelBookingService({
      bookingId,
      userId,
      reason
    });

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Booking cancelled successfully', {
      bookingId,
      userId,
      refundAmount: result.refund.amount,
      refundType: result.refund.type,
      responseTime: `${responseTime}ms`
    });

    // Format and send response using DTO
    const response = formatBookingCancellationResponse(result.booking, result.refund);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to cancel booking', {
      bookingId,
      userId,
      reason,
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
      formatBookingErrorResponse('Internal server error while cancelling booking')
    );
  }
};

/**
 * Get Cancellation Policy
 * 
 * Handles GET /api/v1/bookings/cancellation-policy
 * Returns information about cancellation policy and refund rules
 */
export const getCancellationPolicy = async (req, res) => {
  try {
    logger.info('GetCancellationPolicy request started');

    const cancellationPolicy = {
      success: true,
      message: 'Cancellation policy retrieved successfully',
      data: {
        policy: {
          title: 'GridSpace Cancellation Policy',
          description: 'Our cancellation policy ensures fair refunds for both hosts and guests.',
          rules: [
            {
              timeframe: '48+ hours before start time',
              refund: '100% of booking amount',
              description: 'Full refund for cancellations made 48 or more hours in advance'
            },
            {
              timeframe: '2-48 hours before start time',
              refund: '50% of booking amount',
              description: 'Partial refund (50%) for cancellations made between 2 and 48 hours in advance'
            },
            {
              timeframe: 'Less than 2 hours before start time',
              refund: 'No refund',
              description: 'No refund for cancellations made less than 2 hours before the booking start time'
            }
          ],
          importantNotes: [
            'Cancellation time is calculated based on the booking start time, not the cancellation request time',
            'Refund processing typically takes 3-5 business days',
            'Host cancellations may result in different refund policies',
            'Emergency cancellations may be reviewed on a case-by-case basis'
          ]
        },
        lastUpdated: new Date().toISOString()
      }
    };

    res.status(200).json(cancellationPolicy);

  } catch (error) {
    logger.error('Failed to get cancellation policy', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json(
      formatBookingErrorResponse('Internal server error while retrieving cancellation policy')
    );
  }
};

/**
 * Calculate Cancellation Refund
 * 
 * Handles POST /api/v1/bookings/:id/calculate-refund
 * Calculates potential refund amount for a booking without actually cancelling
 */
export const calculateCancellationRefund = async (req, res) => {
  const startTime = Date.now();
  const { _id: userId } = req.user;
  const { id: bookingId } = req.params;

  try {
    logger.info('CalculateCancellationRefund request started', {
      userId,
      bookingId
    });

    // Get booking details first
    const { getBookingByIdService } = await import('../../services/bookings/booking.service.js');
    const booking = await getBookingByIdService(bookingId, userId, 'user');

    if (!booking) {
      return res.status(404).json(
        formatBookingErrorResponse('Booking not found', 'BOOKING_NOT_FOUND')
      );
    }

    // Calculate refund based on time remaining
    const hoursUntilStart = (booking.startTime - new Date()) / (1000 * 60 * 60);
    let refundAmount = 0;
    let refundType = 'none';
    let refundMessage = '';
    let cancellationAllowed = true;

    if (hoursUntilStart <= 2) {
      // Less than 2 hours - no refund
      refundAmount = 0;
      refundType = 'none';
      refundMessage = 'No refund available for cancellations within 2 hours of booking time';
      cancellationAllowed = false;
    } else if (hoursUntilStart <= 48) {
      // 2-48 hours - 50% refund
      refundAmount = Math.floor(booking.totalAmount * 0.5);
      refundType = 'partial';
      refundMessage = `You will receive a refund of ₦${refundAmount} (50% of booking amount)`;
    } else {
      // 48+ hours - full refund
      refundAmount = booking.totalAmount;
      refundType = 'full';
      refundMessage = `You will receive a full refund of ₦${refundAmount}`;
    }

    const responseTime = Date.now() - startTime;
    logger.info('Cancellation refund calculated', {
      bookingId,
      userId,
      refundAmount,
      refundType,
      hoursUntilStart: Math.round(hoursUntilStart * 10) / 10,
      responseTime: `${responseTime}ms`
    });

    res.status(200).json({
      success: true,
      message: 'Cancellation refund calculated successfully',
      data: {
        booking: {
          _id: booking._id,
          startTime: booking.startTime,
          totalAmount: booking.totalAmount,
          status: booking.status
        },
        calculation: {
          hoursUntilStart: Math.round(hoursUntilStart * 10) / 10,
          refundAmount,
          refundType,
          refundMessage,
          cancellationAllowed,
          processingTime: '3-5 business days'
        },
        policy: {
          timeframe: hoursUntilStart <= 2 ? 'Less than 2 hours' : 
                     hoursUntilStart <= 48 ? '2-48 hours' : '48+ hours',
          percentage: refundType === 'full' ? 100 : refundType === 'partial' ? 50 : 0
        }
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to calculate cancellation refund', {
      bookingId,
      userId,
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
      formatBookingErrorResponse('Internal server error while calculating refund')
    );
  }
};

/**
 * Request Emergency Cancellation
 * 
 * Handles POST /api/v1/bookings/:id/emergency-cancellation
 * Allows users to request emergency cancellation for special circumstances
 */
export const requestEmergencyCancellation = async (req, res) => {
  const startTime = Date.now();
  const { _id: userId } = req.user;
  const { id: bookingId } = req.params;
  const { reason, description, evidence } = req.body;

  try {
    logger.info('RequestEmergencyCancellation started', {
      userId,
      bookingId,
      reason
    });

    // Validate required fields
    if (!reason) {
      return res.status(400).json(
        formatBookingValidationError('Emergency cancellation reason is required')
      );
    }

    if (!description) {
      return res.status(400).json(
        formatBookingValidationError('Detailed description is required for emergency cancellation')
      );
    }

    // Validate reason and description length
    if (reason.length > 100) {
      return res.status(400).json(
        formatBookingValidationError('Reason must be 100 characters or less')
      );
    }

    if (description.length > 1000) {
      return res.status(400).json(
        formatBookingValidationError('Description must be 1000 characters or less')
      );
    }

    // Verify booking exists and user owns it
    const { getBookingByIdService } = await import('../../services/bookings/booking.service.js');
    const booking = await getBookingByIdService(bookingId, userId, 'user');

    if (!booking) {
      return res.status(404).json(
        formatBookingErrorResponse('Booking not found', 'BOOKING_NOT_FOUND')
      );
    }

    // Check if booking can still be cancelled
    const hoursUntilStart = (booking.startTime - new Date()) / (1000 * 60 * 60);
    if (hoursUntilStart <= 0) {
      return res.status(400).json(
        formatBookingErrorResponse('Cannot request emergency cancellation for past bookings', 'BOOKING_ALREADY_STARTED')
      );
    }

    // In a full implementation, this would:
    // 1. Create an emergency cancellation request record
    // 2. Send notifications to admin/host
    // 3. Potentially auto-approve based on reason
    // 4. Track the request status

    // For now, we'll process it as a regular cancellation
    // but mark it as emergency in the cancellation info
    const result = await cancelBookingService({
      bookingId,
      userId,
      reason: `EMERGENCY: ${reason} - ${description}`
    });

    const responseTime = Date.now() - startTime;
    logger.info('Emergency cancellation processed', {
      bookingId,
      userId,
      refundAmount: result.refund.amount,
      responseTime: `${responseTime}ms`
    });

    // Format response with emergency cancellation details
    const response = {
      success: true,
      message: 'Emergency cancellation request processed',
      data: {
        booking: {
          _id: result.booking._id,
          status: result.booking.status,
          paymentStatus: result.booking.paymentStatus,
          refundAmount: result.refund.amount,
          cancellationTime: result.booking.cancellationInfo?.cancelledAt,
          emergencyRequest: {
            reason,
            description,
            processedAt: new Date(),
            note: 'Your emergency cancellation has been processed. Refund processing may take longer due to manual review.'
          }
        },
        refund: result.refund,
        nextSteps: [
          'Your cancellation has been processed',
          'Refund processing may take longer due to emergency review',
          'You will receive email updates on your refund status',
          'Contact support if you have questions about your emergency cancellation'
        ]
      }
    };

    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to process emergency cancellation', {
      bookingId,
      userId,
      reason,
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
      formatBookingErrorResponse('Internal server error while processing emergency cancellation')
    );
  }
};