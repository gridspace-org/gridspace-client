import Joi from "joi";
import AppError from "../utils/AppError.js";
import {
  VALIDATION_SCHEMAS,
  SPACE_CONSTRAINTS,
  BOOKING_CONSTRAINTS,
  FILE_UPLOAD,
  ERROR_MESSAGES,
} from "../config/statuses.js";
import { createLogger } from "../utils/logger.js";

/**
 * Shared Validation Middleware
 *
 * Centralized validation patterns using Joi and our business constants.
 * Ensures consistent validation across all endpoints.
 */

const logger = createLogger();

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} validationType - Type of validation ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const createValidator = (schema, validationType = "body") => {
  return (req, res, next) => {
    const dataToValidate = req[validationType];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      logger.validationError(validationType, error.details, req);

      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      return next(
        new AppError(
          ERROR_MESSAGES.VALIDATION.INVALID_FORMAT(validationType),
          400,
          "VALIDATION_ERROR",
          { validationErrors: errors }
        )
      );
    }

    // Replace the request data with validated and sanitized value
    req[validationType] = value;
    next();
  };
};

/**
 * Validation Schemas
 */

// User Registration Schema
export const userRegistrationSchema = Joi.object({
  fullname: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Full name"),
      "string.min": "Full name must be at least 2 characters",
      "string.max": "Full name cannot exceed 100 characters",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Email"),
      "string.email": ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Password"),
      "string.min": ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD,
      "string.max": "Password cannot exceed 128 characters",
      "string.pattern.base": ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD,
    }),

  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .messages({
      "string.pattern.base": ERROR_MESSAGES.VALIDATION.INVALID_PHONE,
    }),

  role: Joi.string().valid("user", "host").default("user"),
});

// User Login Schema
export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Email"),
      "string.email": ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
    }),

  password: Joi.string()
    .required()
    .messages({
      "string.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Password"),
    }),
});

// Space Creation Schema
export const spaceCreationSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(SPACE_CONSTRAINTS.MIN_TITLE_LENGTH)
    .max(SPACE_CONSTRAINTS.MAX_TITLE_LENGTH)
    .required()
    .messages({
      "string.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Title"),
      "string.min": ERROR_MESSAGES.SPACE.TITLE_TOO_SHORT,
      "string.max": `Title cannot exceed ${SPACE_CONSTRAINTS.MAX_TITLE_LENGTH} characters`,
    }),

  description: Joi.string()
    .trim()
    .min(SPACE_CONSTRAINTS.MIN_DESCRIPTION_LENGTH)
    .max(SPACE_CONSTRAINTS.MAX_DESCRIPTION_LENGTH)
    .required()
    .messages({
      "string.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Description"),
      "string.min": ERROR_MESSAGES.SPACE.DESCRIPTION_TOO_SHORT,
      "string.max": `Description cannot exceed ${SPACE_CONSTRAINTS.MAX_DESCRIPTION_LENGTH} characters`,
    }),

  location: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      "string.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Location"),
      "string.min": "Location must be at least 3 characters",
      "string.max": "Location cannot exceed 200 characters",
    }),

  pricePerHour: Joi.number()
    .min(SPACE_CONSTRAINTS.MIN_PRICE_PER_HOUR)
    .max(SPACE_CONSTRAINTS.MAX_PRICE_PER_HOUR)
    .required()
    .messages({
      "number.empty":
        ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Price per hour"),
      "number.min": `Price per hour must be at least ₦${SPACE_CONSTRAINTS.MIN_PRICE_PER_HOUR}`,
      "number.max": `Price per hour cannot exceed ₦${SPACE_CONSTRAINTS.MAX_PRICE_PER_HOUR}`,
    }),

  capacity: Joi.number()
    .integer()
    .min(SPACE_CONSTRAINTS.MIN_CAPACITY)
    .max(SPACE_CONSTRAINTS.MAX_CAPACITY)
    .required()
    .messages({
      "number.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Capacity"),
      "number.integer": "Capacity must be a whole number",
      "number.min": `Capacity must be at least ${SPACE_CONSTRAINTS.MIN_CAPACITY}`,
      "number.max": `Capacity cannot exceed ${SPACE_CONSTRAINTS.MAX_CAPACITY}`,
    }),

  purposes: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(SPACE_CONSTRAINTS.MAX_PURPOSES)
    .default([])
    .messages({
      "array.max": `Cannot exceed ${SPACE_CONSTRAINTS.MAX_PURPOSES} purposes`,
    }),

  amenities: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(SPACE_CONSTRAINTS.MAX_AMENITIES)
    .default([])
    .messages({
      "array.max": `Cannot exceed ${SPACE_CONSTRAINTS.MAX_AMENITIES} amenities`,
    }),

  rules: Joi.string().trim().max(1000).allow("").default(""),
});

// Booking Creation Schema
export const bookingCreationSchema = Joi.object({
  spaceId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Space ID"),
      "string.pattern.base": "Invalid Space ID format",
    }),

  startTime: Joi.date()
    .iso()
    .greater("now")
    .required()
    .messages({
      "date.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Start time"),
      "date.greater": "Booking must be in the future",
      "date.format": '"startTime" must be in ISO 8601 date format',
    }),

  endTime: Joi.date()
    .iso()
    .greater(Joi.ref("startTime"))
    .required()
    .messages({
      "date.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("End time"),
      "date.greater": "End time must be after start time",
      "date.format": '"endTime" must be in ISO 8601 date format',
    }),

  totalAmount: Joi.number()
    .positive()
    .required()
    .messages({
      "number.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Total amount"),
      "number.positive": "Total amount must be positive",
    }),

  specialRequests: Joi.string().trim().max(500).allow("").default(""),
});

// Pagination Schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.integer": "Page must be a whole number",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.integer": "Limit must be a whole number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});

// Search Filters Schema
export const spaceSearchSchema = Joi.object({
  location: Joi.string().trim().max(200).optional(),

  priceMin: Joi.number().min(0).optional(),

  priceMax: Joi.number()
    .min(0)
    .optional()
    .when("priceMin", {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref("priceMin")),
      otherwise: Joi.optional(),
    }),

  capacity: Joi.number().integer().min(1).optional(),

  purposes: Joi.string().trim().optional(),

  amenities: Joi.string().trim().optional(),

  sortBy: Joi.string()
    .valid(
      "newest",
      "price_low_high",
      "price_high_low",
      "rating",
      "most_popular"
    )
    .default("newest"),
});

// Object ID Validation Schema
export const objectIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "ID is required",
      "string.pattern.base": "Invalid ID format",
    }),
});

// Status Update Schema
export const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .required()
    .messages({
      "string.empty": ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD("Status"),
    }),

  hostNotes: Joi.string().trim().max(500).allow("").default(""),

  cancellationReason: Joi.string().trim().max(200).when("status", {
    is: "cancelled",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

// File Upload Validation Schema
export const fileUploadSchema = Joi.object({
  files: Joi.array()
    .items(
      Joi.object({
        fieldname: Joi.string().required(),
        originalname: Joi.string().required(),
        encoding: Joi.string().required(),
        mimetype: Joi.string()
          .valid(...FILE_UPLOAD.ALLOWED_TYPES)
          .required(),
        size: Joi.number().max(FILE_UPLOAD.MAX_SIZE).required(),
        buffer: Joi.any().required(),
      })
    )
    .min(1)
    .max(SPACE_CONSTRAINTS.MAX_IMAGES)
    .required()
    .messages({
      "array.min": "At least one file is required",
      "array.max": `Cannot exceed ${SPACE_CONSTRAINTS.MAX_IMAGES} files`,
      "any.invalid": "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
      "number.max": `File size cannot exceed ${
        FILE_UPLOAD.MAX_SIZE / (1024 * 1024)
      }MB`,
    }),
});

// Advanced Search Schema
export const advancedSearchSchema = Joi.object({
  location: Joi.string().trim().max(200).optional(),
  priceRange: Joi.object({
    min: Joi.number().min(0).optional(),
    max: Joi.number().min(0).optional(),
  }).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  purposes: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
  amenities: Joi.array().items(Joi.string().trim().max(50)).max(20).optional(),
  features: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
  restrictions: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(10)
    .optional(),
  dateRange: Joi.object({
    start: Joi.date().greater("now").optional(),
    end: Joi.date().greater(Joi.ref("start")).optional(),
  }).optional(),
  availability: Joi.boolean().default(false),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sortBy: Joi.string()
    .valid(
      "newest",
      "price_low_high",
      "price_high_low",
      "rating",
      "most_popular"
    )
    .default("newest"),
  radius: Joi.number().min(0.1).max(100).optional(), // For future geospatial search
});

// Export Ready-to-Use Middleware
export const validateUserRegistration = createValidator(userRegistrationSchema);
export const validateUserLogin = createValidator(userLoginSchema);
export const validateSpaceCreation = createValidator(spaceCreationSchema);
export const validateBookingCreation = createValidator(bookingCreationSchema);
export const validatePagination = createValidator(paginationSchema, "query");
export const validateSpaceSearch = createValidator(spaceSearchSchema, "query");
export const validateObjectId = createValidator(objectIdSchema, "params");
export const validateStatusUpdate = createValidator(statusUpdateSchema);
export const validateAdvancedSearch = createValidator(advancedSearchSchema);
export const validateFileUpload = createValidator(fileUploadSchema);

/**
 * Custom validation functions
 */

// Validate booking time constraints
export const validateBookingTime = (req, res, next) => {
  const { startTime, endTime } = req.body;

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Check if times are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new AppError("Invalid date format", 400));
    }

    // Check if start time is in the future
    if (start <= now) {
      return next(new AppError("Booking must be in the future", 400));
    }

    // Check if end time is after start time
    if (end <= start) {
      return next(new AppError("End time must be after start time", 400));
    }

    // Check booking duration
    const durationMinutes = (end - start) / (1000 * 60);
    if (durationMinutes < BOOKING_CONSTRAINTS.MIN_BOOKING_DURATION) {
      return next(
        new AppError(
          `Minimum booking duration is ${BOOKING_CONSTRAINTS.MIN_BOOKING_DURATION} minutes`,
          400
        )
      );
    }

    if (durationMinutes > BOOKING_CONSTRAINTS.MAX_BOOKING_DURATION) {
      return next(
        new AppError(
          `Maximum booking duration is ${BOOKING_CONSTRAINTS.MAX_BOOKING_DURATION} minutes`,
          400
        )
      );
    }

    // Check advance booking limits
    const hoursUntilStart = (start - now) / (1000 * 60 * 60);
    if (hoursUntilStart < BOOKING_CONSTRAINTS.MIN_ADVANCE_BOOKING) {
      return next(
        new AppError(
          `Must book at least ${BOOKING_CONSTRAINTS.MIN_ADVANCE_BOOKING} hour(s) in advance`,
          400
        )
      );
    }

    if (hoursUntilStart > BOOKING_CONSTRAINTS.MAX_ADVANCE_BOOKING) {
      return next(
        new AppError(
          `Cannot book more than ${BOOKING_CONSTRAINTS.MAX_ADVANCE_BOOKING} hours in advance`,
          400
        )
      );
    }

    next();
  } catch (error) {
    return next(new AppError("Invalid booking time parameters", 400));
  }
};

// Validate price range
export const validatePriceRange = (req, res, next) => {
  const { priceMin, priceMax } = req.query;

  if (priceMin && priceMax) {
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);

    if (isNaN(min) || isNaN(max)) {
      return next(new AppError("Invalid price range format", 400));
    }

    if (min >= max) {
      return next(
        new AppError("Minimum price must be less than maximum price", 400)
      );
    }

    if (
      min < SPACE_CONSTRAINTS.MIN_PRICE_PER_HOUR ||
      max > SPACE_CONSTRAINTS.MAX_PRICE_PER_HOUR
    ) {
      return next(
        new AppError(
          `Price range must be between ₦${SPACE_CONSTRAINTS.MIN_PRICE_PER_HOUR} and ₦${SPACE_CONSTRAINTS.MAX_PRICE_PER_HOUR}`,
          400
        )
      );
    }
  }

  next();
};

// Sanitize string fields
export const sanitizeStringFields = (fields = []) => {
  return (req, res, next) => {
    const sanitizeField = (obj) => {
      for (const field of fields) {
        if (obj[field] && typeof obj[field] === "string") {
          obj[field] = obj[field].trim();
        }
      }
    };

    if (req.body) sanitizeField(req.body);
    if (req.query) sanitizeField(req.query);
    if (req.params) sanitizeField(req.params);

    next();
  };
};

// Logger extensions for validation
logger.validationError = (validationType, errors, req) => {
  logger.warn("Validation error occurred", {
    event: "validation_error",
    validationType,
    errorCount: errors.length,
    errors: errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
    userId: req?.user?._id,
    correlationId: req?.correlationId,
    ip: req?.ip,
  });
};

export default {
  validateUserRegistration,
  validateUserLogin,
  validateSpaceCreation,
  validateBookingCreation,
  validatePagination,
  validateSpaceSearch,
  validateObjectId,
  validateStatusUpdate,
  validateAdvancedSearch,
  validateFileUpload,
  validateBookingTime,
  validatePriceRange,
  sanitizeStringFields,
};
