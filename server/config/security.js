/**
 * Security Configuration
 * Centralized security settings for the application
 */

import helmet from 'helmet';

// Password complexity requirements
const passwordComplexity = {
  minLength: 16,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

// Request size limits
const requestLimits = {
  json: { limit: '10mb' },
  urlencoded: { limit: '10mb', extended: true },
};

// Security headers configuration
const securityHeaders = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
};

// CORS configuration
const corsConfig = (allowedOrigins) => ({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
});

// Health check configuration
const healthCheckConfig = {
  memoryThreshold: 500 * 1024 * 1024, // 500MB
  info: {
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
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
