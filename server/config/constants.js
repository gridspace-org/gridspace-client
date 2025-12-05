/**
 * Application Constants
 * Centralized configuration for magic numbers and constant values
 * used throughout the application.
 */

// ===== JWT & AUTHENTICATION TOKENS =====
export const TOKENS = {
  // Access token expiration (15 minutes)
  ACCESS_EXPIRES_SECONDS: 15 * 60,

  // Refresh token expiration (7 days)
  REFRESH_EXPIRES_DAYS: 7,
  REFRESH_EXPIRES_SECONDS: 7 * 24 * 60 * 60,

  // Password reset token expiration (10 minutes)
  PASSWORD_RESET_EXPIRES_MINUTES: 10,
  PASSWORD_RESET_EXPIRES_MS: 10 * 60 * 1000,

  // Maximum number of refresh tokens per user (prevent token bloat)
  MAX_REFRESH_TOKENS_PER_USER: 5,

  // JWT issuer and audience
  ISSUER: process.env.JWT_ISSUER || "gridspace-backend",
  AUDIENCE: process.env.JWT_AUDIENCE || "gridspace-client",
};

// ===== BOOKING CONFIGURATION =====
export const BOOKING = {
  // Pending booking expiration (5 minutes)
  PENDING_EXPIRES_MS: 5 * 60 * 1000,
  PENDING_EXPIRES_MINUTES: 5,

  // Minimum hours before booking start time to allow cancellation
  MIN_HOURS_FOR_CANCELLATION: 2,

  // Platform fee percentage (10%)
  PLATFORM_FEE_PERCENTAGE: 0.1,

  // Minimum guest count
  MIN_GUEST_COUNT: 1,

  // Booking types
  TYPES: {
    HOURLY: "hourly",
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
  },

  // Booking statuses
  STATUS: {
    PENDING: "pending",
    UPCOMING: "upcoming",
    ONGOING: "ongoing",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    EXPIRED: "expired",
  },

  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "partially_refunded",
  },
};

// ===== PASSWORD CONFIGURATION =====
export const PASSWORD = {
  // Minimum password length
  MIN_LENGTH: 6,

  // bcrypt salt rounds for password hashing
  BCRYPT_ROUNDS: 12,
};

// ===== PAGINATION DEFAULTS =====
export const PAGINATION = {
  // Default page number
  DEFAULT_PAGE: 1,

  // Default items per page
  DEFAULT_LIMIT: 10,

  // Maximum items per page (prevent excessive queries)
  MAX_LIMIT: 100,
};

// ===== WALLET CONFIGURATION =====
export const WALLET = {
  // Currency code
  CURRENCY: process.env.WALLET_CURRENCY || "NGN",

  // Daily withdrawal limit (₦50,000)
  DAILY_WITHDRAWAL_LIMIT:
    parseInt(process.env.WALLET_DAILY_WITHDRAWAL_LIMIT) || 50000,

  // Monthly withdrawal limit (₦500,000)
  MONTHLY_WITHDRAWAL_LIMIT:
    parseInt(process.env.WALLET_MONTHLY_WITHDRAWAL_LIMIT) || 500000,

  // Minimum withdrawal amount (₦500)
  MIN_WITHDRAWAL: parseInt(process.env.WALLET_MIN_WITHDRAWAL) || 500,

  // Transaction types
  TRANSACTION_TYPES: {
    DEPOSIT: "deposit",
    WITHDRAWAL: "withdrawal",
    BOOKING_PAYMENT: "booking_payment",
    BOOKING_REFUND: "booking_refund",
    EARNING: "earning",
    PLATFORM_FEE: "platform_fee",
  },

  // Transaction statuses
  TRANSACTION_STATUS: {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
    REVERSED: "reversed",
  },
};

// ===== USER ROLES & PERMISSIONS =====
export const USER = {
  ROLES: {
    USER: "user",
    HOST: "host",
    ADMIN: "admin",
  },

  AUTH_PROVIDERS: {
    LOCAL: "local",
    GOOGLE: "google",
  },

  SUSPENSION_REASONS: {
    FRAUD: "fraud",
    POLICY_VIOLATION: "policy_violation",
    CHARGEBACK_DISPUTE: "chargeback_dispute",
    ABUSE: "abuse",
    OTHER: "other",
  },
};

// ===== EMAIL & OTP CONFIGURATION =====
export const EMAIL = {
  // OTP expiration time (10 minutes)
  OTP_EXPIRES_MINUTES: 10,
  OTP_EXPIRES_MS: 10 * 60 * 1000,

  // OTP length
  OTP_LENGTH: 6,
};

// ===== RATE LIMITING CONFIGURATION =====
export const RATE_LIMITS = {
  // Global API rate limit
  GLOBAL: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },

  // Authentication endpoints (stricter)
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
    MESSAGE: "Too many authentication attempts, please try again later",
  },

  // Password reset (moderate)
  PASSWORD_RESET: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 3,
    MESSAGE: "Too many password reset requests, please try again later",
  },

  // Payment webhooks (high volume)
  WEBHOOK: {
    WINDOW_MS: 1 * 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
    SKIP_SUCCESSFUL: true,
  },
};

// ===== DATABASE CONFIGURATION =====
export const DATABASE = {
  // MongoDB connection retry attempts
  MAX_RETRY_ATTEMPTS: 5,

  // Retry delay in milliseconds
  RETRY_DELAY_MS: 5000,

  // Query timeout (slow query threshold)
  SLOW_QUERY_THRESHOLD_MS: 100,
};

// ===== HTTP STATUS CODES =====
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// ===== CLOUDINARY CONFIGURATION =====
export const CLOUDINARY = {
  // Maximum file size (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  // Allowed image formats
  ALLOWED_FORMATS: ["jpg", "jpeg", "png", "webp"],

  // Transformation presets
  TRANSFORMATIONS: {
    THUMBNAIL: "w_200,h_200,c_fill",
    MEDIUM: "w_800,h_600,c_fit",
    LARGE: "w_1200,h_900,c_fit",
  },
};

// ===== ENVIRONMENT =====
export const ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",

  // Current environment
  CURRENT: process.env.NODE_ENV || "development",

  // Environment checks
  isDevelopment: () => process.env.NODE_ENV === "development",
  isProduction: () => process.env.NODE_ENV === "production",
  isTest: () => process.env.NODE_ENV === "test",
};

// ===== TIME CONSTANTS =====
export const TIME = {
  // Milliseconds
  ONE_SECOND_MS: 1000,
  ONE_MINUTE_MS: 60 * 1000,
  ONE_HOUR_MS: 60 * 60 * 1000,
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,

  // Seconds
  ONE_MINUTE_SEC: 60,
  ONE_HOUR_SEC: 60 * 60,
  ONE_DAY_SEC: 24 * 60 * 60,
  ONE_WEEK_SEC: 7 * 24 * 60 * 60,
};

export default {
  TOKENS,
  BOOKING,
  PASSWORD,
  PAGINATION,
  WALLET,
  USER,
  EMAIL,
  RATE_LIMITS,
  DATABASE,
  HTTP_STATUS,
  CLOUDINARY,
  ENV,
  TIME,
};
