import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import User from "../models/User.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../controllers/auth/auth.utils.js";
import logger from "../config/logger.js";

/**
 * @desc    Protect routes - verify access token and attach user to request
 * @access  Private
 */
const protectMiddleware = async (req, res, next) => {
  logger.info("Auth middleware called for path:", req.path);
  let token;

  // 1) Get token from Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // 2) Check if token exists
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  try {
    // 3) Verify token
    const decoded = verifyToken(token);

    // 4) Check if user still exists - O(1) indexed lookup
    // Optimization: Only fetch fields needed by auth flow and controllers
    const currentUser = await User.findById(decoded.id).select(
      "_id email fullname role isActive passwordChangedAt +refreshTokens"
    );

    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    // 5) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    // 6) Check if user account is active
    if (currentUser.isActive === false) {
      return next(
        new AppError(
          "Your account has been deactivated. Please contact support.",
          403
        )
      );
    }

    // 7) Grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    // Handle token expiration specifically
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError("Your token has expired! Please log in again.", 401)
      );
    }

    // Handle other JWT errors
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again!", 401));
    }

    // For any other errors
    logger.error(`Authentication error: ${error.message}`, { error });
    return next(
      new AppError("Authentication failed. Please try again later.", 500)
    );
  }
};

export const protect = asyncHandler(protectMiddleware);
export const authenticate = protect; // Alias for backward compatibility

/**
 * @desc    Restrict access to specific roles
 * @param   {Array} roles - Array of allowed roles
 * @access  Private
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

/**
 * @desc    Refresh token if access token is expired
 * @access  Private
 */
export const refreshIfNeeded = async (req, res, next) => {
  // Skip if it's a refresh token request to prevent loops
  if (req.path === "/api/v1/auth/refresh-token") {
    return next();
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  // If no tokens, proceed (will be caught by protect middleware)
  if (!accessToken || !refreshToken) {
    return next();
  }

  try {
    // Try to verify access token using the same verification logic
    verifyToken(accessToken);
    return next(); // Token is valid, proceed
  } catch (error) {
    if (error.name !== "TokenExpiredError") {
      return next(); // Not an expiration error, proceed with normal auth flow
    }

    // Access token is expired, try to refresh
    logger.info("Access token expired, attempting refresh");
    return next(); // Let the main auth middleware handle the expired token
  }
};

/**
 * @desc    Middleware to require onboarding completion
 *          Must be used after protect middleware
 */
export const requireOnboarding = (req, res, next) => {
  if (!req.user.onboardingCompleted) {
    return next(
      new AppError("Please complete onboarding to access this feature.", 403)
    );
  }
  next();
};

/**
 * @desc    Combined middleware for protected routes
 *          Checks authentication and refreshes token if needed
 */
export const auth = [refreshIfNeeded, protect];

/**
 * @desc    Combined middleware for routes requiring full user setup
 *          Checks authentication, refreshes token if needed, and verifies onboarding
 */
export const fullAuth = [refreshIfNeeded, protect, requireOnboarding];
