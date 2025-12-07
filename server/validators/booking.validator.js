import Joi from "joi";

/**
 * VALIDATION: Booking Creation
 * Ensures all booking data meets business requirements before processing
 * Time Complexity: O(1) - Simple object validation
 * Space Complexity: O(1) - Minimal memory usage
 */
export const createBookingValidation = Joi.object({
  spaceId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Space ID must be a valid MongoDB ID",
    "string.length": "Space ID must be 24 characters",
    "any.required": "Space ID is required",
  }),

  startTime: Joi.string()
    .required()
    .custom((value, helpers) => {
      // Check if it's a valid ISO 8601 date string
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
      if (!isoDateRegex.test(value)) {
        return helpers.error("string.isoDate");
      }

      // Check if it's a valid date
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return helpers.error("string.isoDate");
      }

      return value;
    })
    .messages({
      "string.isoDate": "startTime must be in ISO 8601 date format",
      "any.required": "Start time is required",
    }),

  endTime: Joi.string()
    .required()
    .custom((value, helpers) => {
      // Check if it's a valid ISO 8601 date string
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
      if (!isoDateRegex.test(value)) {
        return helpers.error("string.isoDate");
      }

      // Check if it's a valid date
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return helpers.error("string.isoDate");
      }

      return value;
    })
    .messages({
      "string.isoDate": "endTime must be in ISO 8601 date format",
      "any.required": "End time is required",
    }),

  guestCount: Joi.number().integer().min(1).max(100).default(1).messages({
    "number.min": "At least 1 guest is required",
    "number.max": "Cannot exceed 100 guests",
    "number.base": "Guest count must be a number",
  }),

  bookingType: Joi.string()
    .valid("hourly", "daily", "weekly", "monthly")
    .optional()
    .messages({
      "any.only": "Booking type must be one of: hourly, daily, weekly, monthly",
    }),

  specialRequests: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Special requests cannot exceed 500 characters",
  }),
});

/**
 * VALIDATION: Booking Status Update
 * Controls valid status transitions for booking lifecycle management
 * Allows all valid statuses from the Booking model enum
 */
export const updateBookingStatusValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "upcoming", "in_progress", "completed", "cancelled")
    .required()
    .messages({
      "any.only":
        "Status must be one of: pending, upcoming, in_progress, completed, cancelled",
      "any.required": "Status is required",
    }),

  hostNotes: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Host notes cannot exceed 500 characters",
  }),

  cancellationReason: Joi.string()
    .valid("user_request", "host_request", "payment_timeout", "other")
    .when("status", {
      is: "cancelled",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.only": "Invalid cancellation reason",
      "any.required":
        "Cancellation reason is required when status is cancelled",
    }),
});

/**
 * VALIDATION: Booking Reschedule
 * Ensures reschedule requests maintain data integrity
 */
export const rescheduleBookingValidation = Joi.object({
  newStartTime: Joi.string().isoDate().required().messages({
    "string.isoDate": "New start time must be a valid ISO date",
    "any.required": "New start time is required",
  }),

  newEndTime: Joi.string().isoDate().required().messages({
    "string.isoDate": "New end time must be a valid ISO date",
    "any.required": "New end time is required",
  }),

  reason: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Reschedule reason cannot exceed 500 characters",
  }),
});
