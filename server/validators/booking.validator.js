import Joi from 'joi';

/**
 * VALIDATION: Booking Creation
 * Ensures all booking data meets business requirements before processing
 * Time Complexity: O(1) - Simple object validation
 * Space Complexity: O(1) - Minimal memory usage
 */
export const createBookingValidation = Joi.object({
  spaceId: Joi.string().hex().length(24).required()
    .messages({
      'string.hex': 'Space ID must be a valid MongoDB ID',
      'string.length': 'Space ID must be 24 characters',
      'any.required': 'Space ID is required'
    }),
    
  startTime: Joi.date().iso().greater('now').required()
    .messages({
      'date.base': 'Start time must be a valid ISO date',
      'date.greater': 'Start time must be in the future',
      'any.required': 'Start time is required'
    }),
    
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required()
    .messages({
      'date.base': 'End time must be a valid ISO date',
      'date.greater': 'End time must be after start time',
      'any.required': 'End time is required'
    }),
    
  guestCount: Joi.number().integer().min(1).max(100).default(1)
    .messages({
      'number.min': 'At least 1 guest is required',
      'number.max': 'Cannot exceed 100 guests',
      'number.base': 'Guest count must be a number'
    }),
    
  bookingType: Joi.string().valid('hourly', 'daily').default('hourly')
    .messages({
      'any.only': 'Booking type must be either hourly or daily'
    }),
    
  specialRequests: Joi.string().max(500).optional().allow('')
    .messages({
      'string.max': 'Special requests cannot exceed 500 characters'
    })
});

/**
 * VALIDATION: Booking Status Update
 * Controls valid status transitions for booking lifecycle management
 * Allows all valid statuses from the Booking model enum
 */
export const updateBookingStatusValidation = Joi.object({
  status: Joi.string().valid('pending', 'upcoming', 'in_progress', 'completed', 'cancelled').required()
    .messages({
      'any.only': 'Status must be one of: pending, upcoming, in_progress, completed, cancelled',
      'any.required': 'Status is required'
    }),
    
  hostNotes: Joi.string().max(500).optional().allow('')
    .messages({
      'string.max': 'Host notes cannot exceed 500 characters'
    }),
    
  cancellationReason: Joi.string()
    .valid('user_request', 'host_request', 'payment_timeout', 'other')
    .when('status', {
      is: 'cancelled',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.only': 'Invalid cancellation reason',
      'any.required': 'Cancellation reason is required when status is cancelled'
    })
});

/**
 * VALIDATION: Booking Reschedule
 * Ensures reschedule requests maintain data integrity
 */
export const rescheduleBookingValidation = Joi.object({
  newStartTime: Joi.date().iso().greater('now').required()
    .messages({
      'date.base': 'New start time must be a valid ISO date',
      'date.greater': 'New start time must be in the future',
      'any.required': 'New start time is required'
    }),
    
  newEndTime: Joi.date().iso().greater(Joi.ref('newStartTime')).required()
    .messages({
      'date.base': 'New end time must be a valid ISO date',
      'date.greater': 'New end time must be after new start time',
      'any.required': 'New end time is required'
    }),
    
  reason: Joi.string().max(500).optional().allow('')
    .messages({
      'string.max': 'Reschedule reason cannot exceed 500 characters'
    })
});