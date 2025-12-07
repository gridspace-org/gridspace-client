import AppError from './AppError.js';
import {
  RESPONSE_CODES,
  ERROR_MESSAGES,
  BUSINESS_RULES
} from '../config/statuses.js';
import { createLogger } from './logger.js';

/**
 * Standardized Error Handling Utility
 * 
 * Provides consistent error handling patterns across the entire application.
 * Ensures all errors are properly formatted, logged, and responded to consistently.
 */

const logger = createLogger();

/**
 * Create standardized success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Standardized success response
 */
export const createSuccessResponse = (data = null, message = 'Operation completed successfully', metadata = {}) => {
  return {
    success: true,
    message,
    data,
    ...metadata,
    timestamp: new Date().toISOString()
  };
};

/**
 * Create standardized error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Business error code
 * @param {Object} details - Additional error details
 * @param {Object} req - Express request object for logging
 * @returns {Object} Standardized error response
 */
export const createErrorResponse = (message, statusCode = 500, code = 'INTERNAL_ERROR', details = null, req = null) => {
  // Log the error with context
  logger.error('Error response generated', {
    event: 'error_response',
    message,
    statusCode,
    errorCode: code,
    details,
    userId: req?.user?._id,
    correlationId: req?.correlationId,
    url: req?.originalUrl,
    method: req?.method,
    ip: req?.ip
  });

  const response = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString()
    }
  };

  // Add details in development or for specific error types
  if (details && (process.env.NODE_ENV === 'development' || code.startsWith('VALIDATION'))) {
    response.error.details = details;
  }

  // Add request ID for debugging
  if (req?.correlationId) {
    response.error.requestId = req.correlationId;
  }

  return response;
};

/**
 * Create validation error response
 * @param {Array} validationErrors - Array of validation errors
 * @param {Object} req - Express request object
 * @returns {Object} Standardized validation error response
 */
export const createValidationErrorResponse = (validationErrors, req = null) => {
  const formattedErrors = validationErrors.map(error => ({
    field: error.path?.join('.') || error.field || 'unknown',
    message: error.message,
    value: error.context?.value
  }));

  logger.warn('Validation error', {
    event: 'validation_error',
    errorCount: formattedErrors.length,
    errors: formattedErrors,
    userId: req?.user?._id,
    correlationId: req?.correlationId
  });

  return createErrorResponse(
    'Validation failed',
    422,
    'VALIDATION_ERROR',
    { validationErrors: formattedErrors },
    req
  );
};

/**
 * Create authentication error response
 * @param {string} message - Error message
 * @param {Object} req - Express request object
 * @returns {Object} Standardized authentication error response
 */
export const createAuthErrorResponse = (message = 'Authentication required', req = null) => {
  logger.security('Authentication error', {
    event: 'auth_error',
    message,
    url: req?.originalUrl,
    ip: req?.ip,
    userAgent: req?.headers?.['user-agent'],
    correlationId: req?.correlationId
  });

  return createErrorResponse(message, 401, 'AUTHENTICATION_ERROR', null, req);
};

/**
 * Create authorization error response
 * @param {string} message - Error message
 * @param {Object} req - Express request object
 * @returns {Object} Standardized authorization error response
 */
export const createAuthzErrorResponse = (message = 'Insufficient permissions', req = null) => {
  logger.security('Authorization error', {
    event: 'authz_error',
    message,
    userId: req?.user?._id,
    userRole: req?.user?.role,
    url: req?.originalUrl,
    correlationId: req?.correlationId
  });

  return createErrorResponse(message, 403, 'AUTHORIZATION_ERROR', null, req);
};

/**
 * Create resource not found error response
 * @param {string} resource - Type of resource (e.g., 'booking', 'space')
 * @param {Object} req - Express request object
 * @returns {Object} Standardized not found error response
 */
export const createNotFoundErrorResponse = (resource = 'Resource', req = null) => {
  const message = `${resource} not found`;
  
  return createErrorResponse(message, 404, 'RESOURCE_NOT_FOUND', null, req);
};

/**
 * Create conflict error response
 * @param {string} message - Error message
 * @param {Object} details - Additional conflict details
 * @param {Object} req - Express request object
 * @returns {Object} Standardized conflict error response
 */
export const createConflictErrorResponse = (message = 'Resource conflict', details = null, req = null) => {
  logger.warn('Resource conflict', {
    event: 'resource_conflict',
    message,
    details,
    userId: req?.user?._id,
    correlationId: req?.correlationId
  });

  return createErrorResponse(message, 409, 'RESOURCE_CONFLICT', details, req);
};

/**
 * Create business logic error response
 * @param {string} message - Error message
 * @param {string} code - Business error code
 * @param {Object} details - Additional business logic details
 * @param {Object} req - Express request object
 * @returns {Object} Standardized business logic error response
 */
export const createBusinessErrorResponse = (message, code = 'BUSINESS_LOGIC_ERROR', details = null, req = null) => {
  logger.warn('Business logic error', {
    event: 'business_error',
    message,
    code,
    details,
    userId: req?.user?._id,
    correlationId: req?.correlationId
  });

  return createErrorResponse(message, 400, code, details, req);
};

/**
 * Express error handling middleware
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let errorCode = error.code || 'INTERNAL_ERROR';
  let message = error.message || 'Internal server error';
  let details = error.details || null;

  // Handle different error types
  if (error.name === 'ValidationError') {
    // Mongoose validation error
    const validationErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = { validationErrors };
    
  } else if (error.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId)
    statusCode = 400;
    errorCode = 'INVALID_ID_FORMAT';
    message = 'Invalid ID format';
    
  } else if (error.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    errorCode = 'DUPLICATE_RESOURCE';
    message = 'Resource already exists';
    const field = Object.keys(error.keyValue)[0];
    details = { field, value: error.keyValue[field] };
    
  } else if (error.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
    
  } else if (error.name === 'TokenExpiredError') {
    // JWT expired error
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
    
  } else if (error.name === 'MulterError') {
    // File upload error
    statusCode = 400;
    errorCode = 'FILE_UPLOAD_ERROR';
    message = error.message;
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large';
      errorCode = 'FILE_TOO_LARGE';
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded';
      errorCode = 'TOO_MANY_FILES';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
      errorCode = 'UNEXPECTED_FILE';
    }
  }

  // Log the error with full context
  logger.error('Express error handler processing error', {
    event: 'express_error',
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack,
    statusCode,
    errorCode,
    userId: req?.user?._id,
    correlationId: req?.correlationId,
    url: req?.originalUrl,
    method: req?.method,
    ip: req?.ip
  });

  // Send standardized error response
  const errorResponse = createErrorResponse(message, statusCode, errorCode, details, req);
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Catch async errors in service layer
 * @param {Function} fn - Async service function
 * @returns {Function} Wrapped function with error handling
 */
export const catchAsync = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      // Re-throw as AppError if not already an AppError
      if (!(error instanceof AppError)) {
        throw new AppError(
          error.message || 'Service operation failed',
          error.statusCode || 500,
          error.code || 'SERVICE_ERROR'
        );
      }
      throw error;
    }
  };
};

/**
 * Create not found error for routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn('Route not found', {
    event: 'route_not_found',
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers?.['user-agent'],
    correlationId: req.correlationId
  });
  
  next(new AppError(message, 404, 'ROUTE_NOT_FOUND'));
};

/**
 * Handle specific business logic errors
 */

// Booking-specific errors
export const handleBookingError = (error, req) => {
  switch (error.code) {
    case 'BOOKING_CONFLICT':
      return createConflictErrorResponse(
        'Time slot already booked',
        { conflictingBookingId: error.details?.bookingId },
        req
      );
      
    case 'INVALID_STATUS_TRANSITION':
      return createBusinessErrorResponse(
        error.message,
        'INVALID_STATUS_TRANSITION',
        { fromStatus: error.details?.fromStatus, toStatus: error.details?.toStatus },
        req
      );
      
    case 'SPACE_UNAVAILABLE':
      return createBusinessErrorResponse(
        'Space is not available for the selected time',
        'SPACE_UNAVAILABLE',
        req
      );
      
    default:
      return createBusinessErrorResponse(error.message, 'BOOKING_ERROR', error.details, req);
  }
};

// Space-specific errors
export const handleSpaceError = (error, req) => {
  switch (error.code) {
    case 'SPACE_NOT_FOUND':
      return createNotFoundErrorResponse('Space', req);
      
    case 'SPACE_OWNERSHIP_REQUIRED':
      return createAuthzErrorResponse('You can only manage your own spaces', req);
      
    case 'MAX_IMAGES_REACHED':
      return createBusinessErrorResponse(
        'Maximum number of images reached',
        'MAX_IMAGES_REACHED',
        { maxImages: error.details?.maxImages },
        req
      );
      
    default:
      return createBusinessErrorResponse(error.message, 'SPACE_ERROR', error.details, req);
  }
};

// Payment-specific errors (for future Monnify integration)
export const handlePaymentError = (error, req) => {
  switch (error.code) {
    case 'PAYMENT_FAILED':
      return createBusinessErrorResponse(
        'Payment processing failed',
        'PAYMENT_FAILED',
        error.details,
        req
      );
      
    case 'INSUFFICIENT_FUNDS':
      return createBusinessErrorResponse(
        'Insufficient funds for this transaction',
        'INSUFFICIENT_FUNDS',
        req
      );
      
    case 'REFUND_NOT_AVAILABLE':
      return createBusinessErrorResponse(
        'Refund not available for this booking',
        'REFUND_NOT_AVAILABLE',
        req
      );
      
    default:
      return createBusinessErrorResponse(error.message, 'PAYMENT_ERROR', error.details, req);
  }
};

/**
 * Create error response based on error type
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @returns {Object} Appropriate error response
 */
export const handleError = (error, req) => {
  // If it's an AppError, use its specific handler
  if (error instanceof AppError) {
    switch (error.category) {
      case 'BOOKING':
        return handleBookingError(error, req);
      case 'SPACE':
        return handleSpaceError(error, req);
      case 'PAYMENT':
        return handlePaymentError(error, req);
      default:
        return createErrorResponse(error.message, error.statusCode, error.code, error.details, req);
    }
  }
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return createValidationErrorResponse(
      Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      })),
      req
    );
  }
  
  // Default error handling
  return createErrorResponse(
    process.env.NODE_ENV === 'production' 
      ? ERROR_MESSAGES.SYSTEM.INTERNAL_ERROR 
      : error.message,
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? { stack: error.stack } : null,
    req
  );
};

/**
 * Middleware to handle validation errors from Joi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleJoiValidationError = (error, req, res, next) => {
  if (error.isJoi) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return res.status(422).json(
      createValidationErrorResponse(validationErrors, req)
    );
  }
  next(error);
};

export default {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createAuthErrorResponse,
  createAuthzErrorResponse,
  createNotFoundErrorResponse,
  createConflictErrorResponse,
  createBusinessErrorResponse,
  errorHandler,
  asyncHandler,
  catchAsync,
  notFound,
  handleBookingError,
  handleSpaceError,
  handlePaymentError,
  handleError,
  handleJoiValidationError
};