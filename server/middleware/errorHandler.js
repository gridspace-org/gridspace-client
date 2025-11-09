import AppError from '../utils/AppError.js';
import { logger } from '../config/logger.js';

const createErrorFromUnknown = (err) => {
  if (err instanceof AppError) {
    return err;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return new AppError(message, statusCode, {
    isOperational: false,
    details: err.stack || err,
  });
};

export const errorConverter = (err, req, res, next) => {
  next(createErrorFromUnknown(err));
};

export const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message, isOperational, details } = err;
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    if (details) {
      response.details = details;
    }
  }

  logger.error('Request error', {
    path: req.originalUrl,
    method: req.method,
    statusCode,
    isOperational,
    message,
    details,
  });

  res.status(statusCode).json(response);
};
