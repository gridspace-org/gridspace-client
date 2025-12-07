import { v4 as uuidv4 } from "uuid";
import logger from "../config/logger.js";

/**
 * Request ID tracing middleware
 * Adds unique request ID for better debugging and monitoring
 */
const requestIdMiddleware = (req, res, next) => {
  // Generate or use existing request ID
  req.requestId = req.headers["x-request-id"] || uuidv4();

  // Add request ID to response headers
  res.setHeader("X-Request-ID", req.requestId);

  // Add request ID to logger context
  logger.defaultMeta = {
    ...logger.defaultMeta,
    requestId: req.requestId,
  };

  // Log request start
  logger.info("Request started", {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Override res.end to log request completion
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    logger.info("Request completed", {
      requestId: req.requestId,
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime,
    });

    originalEnd.call(this, chunk, encoding);
  };

  // Set start time for response time tracking
  req.startTime = Date.now();

  next();
};

export default requestIdMiddleware;
