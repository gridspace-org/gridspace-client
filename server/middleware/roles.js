import { logger } from "../config/logger.js";
import { authenticate } from "./auth.js";

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.error("Access denied. Authentication required.");
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }
    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Access denied. User ${req.user._id?.toString()} lacks required role. Required: ${roles.join(", ")}, current: ${req.user.role}`
      );
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};

export const adminOnly = () => [authenticate, requireRole("admin")];