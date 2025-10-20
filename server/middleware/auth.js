import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

/**
 * Enhanced authentication middleware with user status checks
 * O(1) user lookup with indexed _id query
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user with active status check - O(1) indexed lookup
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not found.",
      });
    }

    // Check if user account is active
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account suspended. Please contact support.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token expired.",
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

/**
 * Optional middleware to require onboarding completion
 * O(1) check on user.onboardingCompleted field
 */
export const requireOnboarding = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!req.user.onboardingCompleted) {
    return res.status(403).json({
      success: false,
      message: "Please complete onboarding to access this feature.",
    });
  }

  next();
};

/**
 * Combined middleware for routes requiring full user setup
 * Chain: authenticate → requireOnboarding
 */
export const fullAuth = [authenticate, requireOnboarding];