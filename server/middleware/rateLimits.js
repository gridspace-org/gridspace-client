import rateLimit from "express-rate-limit";
import { RATE_LIMITS } from "../config/constants.js";
import logger from "../config/logger.js";

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute-force attacks on login, registration, etc.
 *
 * Limits: 5 requests per 15 minutes
 */
export const authRateLimit = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX_REQUESTS,
  message: RATE_LIMITS.AUTH.MESSAGE,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  handler: (req, res) => {
    logger.warn("[SECURITY] Auth rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      message: RATE_LIMITS.AUTH.MESSAGE,
      retryAfter: Math.ceil(RATE_LIMITS.AUTH.WINDOW_MS / 1000 / 60), // minutes
    });
  },
});

/**
 * Moderate rate limiter for password reset requests
 * More restrictive to prevent abuse
 *
 * Limits: 3 requests per hour
 */
export const passwordResetLimit = rateLimit({
  windowMs: RATE_LIMITS.PASSWORD_RESET.WINDOW_MS,
  max: RATE_LIMITS.PASSWORD_RESET.MAX_REQUESTS,
  message: RATE_LIMITS.PASSWORD_RESET.MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn("[SECURITY] Password reset rate limit exceeded", {
      ip: req.ip,
      email: req.body?.email?.substring(0, 50),
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      message: RATE_LIMITS.PASSWORD_RESET.MESSAGE,
      retryAfter: Math.ceil(RATE_LIMITS.PASSWORD_RESET.WINDOW_MS / 1000 / 60), // minutes
    });
  },
});

/**
 * High-volume rate limiter for payment webhooks
 * Allows legitimate webhook traffic while preventing abuse
 *
 * Limits: 100 requests per minute
 */
export const webhookRateLimit = rateLimit({
  windowMs: RATE_LIMITS.WEBHOOK.WINDOW_MS,
  max: RATE_LIMITS.WEBHOOK.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: RATE_LIMITS.WEBHOOK.SKIP_SUCCESSFUL,
  handler: (req, res) => {
    logger.error("[SECURITY] Webhook rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      message: "Too many webhook requests",
    });
  },
});

/**
 * General API rate limiter
 * Applied globally to all API endpoints as a baseline
 *
 * Limits: 100 requests per 15 minutes
 */
export const apiRateLimit = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.WINDOW_MS,
  max: RATE_LIMITS.GLOBAL.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn("[SECURITY] API rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
    });
  },
});
