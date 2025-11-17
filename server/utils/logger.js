import winston from "winston";
import { v4 as uuidv4 } from "uuid";

/**
 * Standardized Logging Utility for GridSpace API
 *
 * Provides consistent logging patterns with correlation IDs, structured logging,
 * and standardized log levels across all modules.
 *
 * Features:
 * - Correlation ID tracking for request tracing
 * - User ID inclusion in logs for user-specific operations
 * - Structured logging with consistent format
 * - Environment-specific log levels
 * - Error context preservation
 * - Performance timing tracking
 */

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

// Determine log level based on environment
const logLevel =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === "production" ? "info" : "debug");

// Custom format for console output in development
const devFormat = printf(({ timestamp, level, message, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
  return `${timestamp} [${level}] ${message} ${metaStr}`;
});

// Create Winston logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: "gridspace-api",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? combine(colorize(), json())
          : combine(colorize(), devFormat),
    }),

    // File transport for errors in production
    ...(process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: "logs/combined.log",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        ]
      : []),
  ],

  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === "production"
      ? [new winston.transports.File({ filename: "logs/exceptions.log" })]
      : []),
  ],

  rejectionHandlers: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === "production"
      ? [new winston.transports.File({ filename: "logs/rejections.log" })]
      : []),
  ],
});

/**
 * Extract correlation ID and user ID from request object
 * @param {Object} req - Express request object
 * @returns {Object} Context with correlation ID and user ID
 */
const extractContext = (req) => {
  const context = {
    correlationId:
      req?.headers?.["x-correlation-id"] || req?.correlationId || uuidv4(),
    userId: req?.user?._id || req?.user?.id || null,
    sessionId: req?.sessionID || req?.headers?.["x-session-id"] || null,
    ip:
      req?.ip ||
      req?.connection?.remoteAddress ||
      req?.headers?.["x-forwarded-for"] ||
      "unknown",
    userAgent: req?.headers?.["user-agent"] || "unknown",
    method: req?.method,
    url: req?.originalUrl || req?.url,
    httpVersion: req?.httpVersion,
  };

  // Attach correlation ID to request for downstream use
  if (req && !req.correlationId) {
    req.correlationId = context.correlationId;
  }

  return context;
};

/**
 * Create a child logger with additional context
 * @param {Object} parentLogger - Parent logger instance
 * @param {Object} additionalMeta - Additional metadata to include
 * @returns {Object} Child logger
 */
const createChildLogger = (parentLogger, additionalMeta = {}) => {
  return parentLogger.child(additionalMeta);
};

/**
 * Standard logging methods with correlation ID and user context
 */
export const createLogger = (context = {}) => {
  const baseLogger = createChildLogger(logger, context);

  return {
    ...baseLogger,

    /**
     * Log method entry with timing
     * @param {string} methodName - Name of the method
     * @param {Object} params - Method parameters
     * @param {Object} req - Express request object for context
     */
    methodEntry(methodName, params = {}, req = null) {
      const logContext = req ? extractContext(req) : {};
      this.info(`Method entry: ${methodName}`, {
        event: "method_entry",
        method: methodName,
        params: sanitizeParams(params),
        ...logContext,
      });
    },

    /**
     * Log method exit with timing
     * @param {string} methodName - Name of the method
     * @param {Object} result - Method result
     * @param {number} duration - Execution duration in ms
     * @param {Object} req - Express request object for context
     */
    methodExit(methodName, result = null, duration = null, req = null) {
      const logContext = req ? extractContext(req) : {};
      this.info(`Method exit: ${methodName}`, {
        event: "method_exit",
        method: methodName,
        duration: duration ? `${duration}ms` : null,
        resultType: result ? typeof result : null,
        ...logContext,
      });
    },

    /**
     * Log API request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {number} duration - Request duration in ms
     */
    apiRequest(req, res, duration = null) {
      const logContext = extractContext(req);
      this.info("API Request", {
        event: "api_request",
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: duration ? `${duration}ms` : null,
        ip: logContext.ip,
        userAgent: logContext.userAgent,
        userId: logContext.userId,
        correlationId: logContext.correlationId,
      });
    },

    /**
     * Log business operation
     * @param {string} operation - Name of the business operation
     * @param {Object} data - Operation data
     * @param {Object} req - Express request object for context
     */
    businessOperation(operation, data = {}, req = null) {
      const logContext = req ? extractContext(req) : {};
      this.info(`Business operation: ${operation}`, {
        event: "business_operation",
        operation,
        data: sanitizeBusinessData(data),
        ...logContext,
      });
    },

    /**
     * Log security events
     * @param {string} event - Security event type
     * @param {Object} details - Event details
     * @param {Object} req - Express request object for context
     */
    security(event, details = {}, req = null) {
      const logContext = req ? extractContext(req) : {};
      this.warn(`Security event: ${event}`, {
        event: "security",
        securityEvent: event,
        details,
        ...logContext,
      });
    },

    /**
     * Log performance metrics
     * @param {string} operation - Operation name
     * @param {number} duration - Duration in ms
     * @param {Object} metadata - Additional metadata
     * @param {Object} req - Express request object for context
     */
    performance(operation, duration, metadata = {}, req = null) {
      const logContext = req ? extractContext(req) : {};
      this.info(`Performance: ${operation}`, {
        event: "performance",
        operation,
        duration: `${duration}ms`,
        ...metadata,
        ...logContext,
      });
    },

    /**
     * Log with custom event type
     * @param {string} level - Log level (info, warn, error, debug)
     * @param {string} event - Custom event type
     * @param {string} message - Log message
     * @param {Object} metadata - Additional metadata
     * @param {Object} req - Express request object for context
     */
    custom(level, event, message, metadata = {}, req = null) {
      const logContext = req ? extractContext(req) : {};
      this[level](message, {
        event,
        ...metadata,
        ...logContext,
      });
    },
  };
};

/**
 * Sanitize parameters to remove sensitive information
 * @param {Object} params - Parameters to sanitize
 * @returns {Object} Sanitized parameters
 */
const sanitizeParams = (params) => {
  if (!params || typeof params !== "object") {
    return params;
  }

  const sensitiveKeys = [
    "password",
    "token",
    "secret",
    "key",
    "credential",
    "auth",
  ];
  const sanitized = { ...params };

  for (const key in sanitized) {
    if (
      sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
    ) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeParams(sanitized[key]);
    }
  }

  return sanitized;
};

/**
 * Sanitize business data for logging
 * @param {Object} data - Business data to sanitize
 * @returns {Object} Sanitized business data
 */
const sanitizeBusinessData = (data) => {
  if (!data) return data;

  const sanitized = { ...data };

  // Remove or mask sensitive business data
  if (sanitized.creditCard) {
    sanitized.creditCard = `****-****-****-${sanitized.creditCard.slice(-4)}`;
  }

  if (sanitized.bankAccount) {
    sanitized.bankAccount = `****${sanitized.bankAccount.slice(-4)}`;
  }

  return sanitizeParams(sanitized);
};

/**
 * Middleware to add correlation ID to all requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const correlationIdMiddleware = (req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || uuidv4();

  req.correlationId = correlationId;
  res.setHeader("X-Correlation-ID", correlationId);

  next();
};

/**
 * Request timing middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const requestTimingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to log request completion
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - startTime;

    // Create logger and log request
    const logger = createLogger();
    logger.apiRequest(req, res, duration);

    // Call original end method
    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Create a module-specific logger
 * @param {string} moduleName - Name of the module
 * @param {Object} req - Express request object for context
 * @returns {Object} Module logger
 */
export const createModuleLogger = (moduleName, req = null) => {
  const context = req ? extractContext(req) : {};
  return createLogger({
    module: moduleName,
    ...context,
  });
};

// Export default logger instance
export default logger;

// Export utility functions
export { createChildLogger, extractContext, correlationIdMiddleware };
