/**
 * Security Configuration
 * Centralized security settings for the application
 */

import helmet from "helmet";

// Password complexity requirements
const passwordComplexity = {
  minLength: 12,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

// Request size limits
const requestLimits = {
  json: { limit: "1mb" },
  urlencoded: { limit: "1mb", extended: true },
};

// Security headers configuration
const securityHeaders = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginOpenerPolicy: {
    policy: 'same-origin-allow-popups', // Allow OAuth popups to communicate
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: "deny",
  },
  noSniff: true,
  xssFilter: true,
};

// CORS configuration
const corsConfig = (allowedOrigins) => {
  let origins = [];

  if (typeof allowedOrigins === "string") {
    origins = allowedOrigins.split(",").map((origin) => origin.trim());
  } else if (Array.isArray(allowedOrigins)) {
    origins = allowedOrigins.map((origin) => origin.trim());
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (origins.includes(origin) || origins.includes("*")) {
        return callback(null, true);
      }
      return callback(
        new Error(
          `Not allowed by CORS. Origin: ${origin}, Allowed: ${origins.join(
            ", "
          )}`
        )
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Total-Count"],
    maxAge: 86400, // 24 hours
  };
};

// Health check configuration
const healthCheckConfig = {
  memoryThreshold: 500 * 1024 * 1024, // 500MB
  info: {
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },
};

export {
  passwordComplexity,
  requestLimits,
  securityHeaders,
  corsConfig,
  healthCheckConfig,
};

// Note: This file uses CommonJS exports for compatibility with some middleware that might require it.
// The main app.js will still use ES modules via dynamic import if needed.
