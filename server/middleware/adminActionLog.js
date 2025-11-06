import { AdminAction } from '../models/AdminAction.js';
import { logger } from '../config/logger.js';

/**
 * Middleware to log admin actions to the database
 * Should be used after the main controller logic
 */
const adminActionLogger = async (req, res, next) => {
  // Skip if not an admin route or not an admin user
  if (!req.user || req.user.role !== 'admin') {
    return next();
  }

  // Skip logging for GET requests by default
  if (req.method === 'GET') {
    return next();
  }

  try {
    // Capture the action details
    const action = {
      adminId: req.user._id,
      action: `${req.method} ${req.originalUrl}`,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestBody: req.method !== 'GET' ? req.body : undefined,
      params: req.params,
      query: req.query,
    };

    // Save to database
    await AdminAction.create(action);
    
    logger.info(`[Admin Action] ${req.user.email} - ${action.action}`, {
      adminId: req.user._id,
      action: action.action,
      statusCode: res.statusCode
    });
  } catch (error) {
    // Don't fail the request if logging fails
    logger.error('Failed to log admin action', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      action: `${req.method} ${req.originalUrl}`
    });
  } finally {
    next();
  }
};

export { adminActionLogger };
