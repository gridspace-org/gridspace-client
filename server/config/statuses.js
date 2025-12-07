/**
 * Centralized Business Constants and Status Definitions
 * 
 * This file contains all business rules, status transitions, and constants
 * used throughout the GridSpace application. Centralizing these ensures
 * consistency and makes it easy to update business rules.
 */

// Booking Status Constants
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

// Booking Status Labels (for UI)
export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUSES.PENDING]: 'Pending',
  [BOOKING_STATUSES.CONFIRMED]: 'Confirmed',
  [BOOKING_STATUSES.UPCOMING]: 'Upcoming',
  [BOOKING_STATUSES.IN_PROGRESS]: 'In Progress',
  [BOOKING_STATUSES.COMPLETED]: 'Completed',
  [BOOKING_STATUSES.CANCELLED]: 'Cancelled',
  [BOOKING_STATUSES.REJECTED]: 'Rejected'
};

// Valid Booking Status Transitions
export const BOOKING_STATUS_TRANSITIONS = {
  [BOOKING_STATUSES.PENDING]: [
    BOOKING_STATUSES.CONFIRMED,
    BOOKING_STATUSES.UPCOMING,
    BOOKING_STATUSES.CANCELLED,
    BOOKING_STATUSES.REJECTED
  ],
  [BOOKING_STATUSES.CONFIRMED]: [
    BOOKING_STATUSES.UPCOMING,
    BOOKING_STATUSES.CANCELLED
  ],
  [BOOKING_STATUSES.UPCOMING]: [
    BOOKING_STATUSES.IN_PROGRESS,
    BOOKING_STATUSES.CANCELLED
  ],
  [BOOKING_STATUSES.IN_PROGRESS]: [
    BOOKING_STATUSES.COMPLETED,
    BOOKING_STATUSES.CANCELLED
  ],
  [BOOKING_STATUSES.COMPLETED]: [], // Terminal state
  [BOOKING_STATUSES.CANCELLED]: [], // Terminal state
  [BOOKING_STATUSES.REJECTED]: [] // Terminal state
};

// Check if status transition is valid
export const isValidBookingStatusTransition = (fromStatus, toStatus) => {
  const validTransitions = BOOKING_STATUS_TRANSITIONS[fromStatus];
  return validTransitions ? validTransitions.includes(toStatus) : false;
};

// Payment Status Constants
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIALLY_REFUNDED: 'partially_refunded',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Payment Status Labels
export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUSES.PENDING]: 'Payment Pending',
  [PAYMENT_STATUSES.PAID]: 'Paid',
  [PAYMENT_STATUSES.PARTIALLY_REFUNDED]: 'Partially Refunded',
  [PAYMENT_STATUSES.REFUNDED]: 'Refunded',
  [PAYMENT_STATUSES.FAILED]: 'Payment Failed',
  [PAYMENT_STATUSES.CANCELLED]: 'Payment Cancelled'
};

// Space Status Constants
export const SPACE_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  SUSPENDED: 'suspended'
};

// Space Status Labels
export const SPACE_STATUS_LABELS = {
  [SPACE_STATUSES.ACTIVE]: 'Active',
  [SPACE_STATUSES.INACTIVE]: 'Inactive',
  [SPACE_STATUSES.MAINTENANCE]: 'Under Maintenance',
  [SPACE_STATUSES.SUSPENDED]: 'Suspended'
};

// User Role Constants
export const USER_ROLES = {
  ADMIN: 'admin',
  HOST: 'host',
  USER: 'user'
};

// User Role Labels
export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.HOST]: 'Host',
  [USER_ROLES.USER]: 'User'
};

// Refund Policy Constants
export const REFUND_POLICY = {
  FULL_REFUND_HOURS: 48, // Full refund for cancellations 48+ hours in advance
  PARTIAL_REFUND_HOURS: 2, // Partial refund for cancellations 2-48 hours in advance
  PARTIAL_REFUND_PERCENTAGE: 0.5, // 50% refund
  NO_REFUND_HOURS: 2 // No refund for cancellations within 2 hours
};

// Calculate refund amount based on timing
export const calculateRefundAmount = (totalAmount, hoursUntilStart) => {
  if (hoursUntilStart >= REFUND_POLICY.FULL_REFUND_HOURS) {
    return {
      amount: totalAmount,
      percentage: 1.0,
      reason: 'full_refund_48h',
      message: 'Full refund available'
    };
  } else if (hoursUntilStart >= REFUND_POLICY.PARTIAL_REFUND_HOURS) {
    return {
      amount: Math.floor(totalAmount * REFUND_POLICY.PARTIAL_REFUND_PERCENTAGE),
      percentage: REFUND_POLICY.PARTIAL_REFUND_PERCENTAGE,
      reason: 'partial_refund_50p',
      message: '50% refund available'
    };
  } else {
    return {
      amount: 0,
      percentage: 0,
      reason: 'no_refund_within_2h',
      message: 'No refund available for cancellations within 2 hours'
    };
  }
};

// Booking Validation Constants
export const BOOKING_CONSTRAINTS = {
  MIN_BOOKING_DURATION: 30, // Minimum booking duration in minutes
  MAX_BOOKING_DURATION: 480, // Maximum booking duration in minutes (8 hours)
  MIN_ADVANCE_BOOKING: 1, // Minimum advance booking in hours
  MAX_ADVANCE_BOOKING: 720, // Maximum advance booking in hours (30 days)
  CANCELLATION_BUFFER: 120 // Cancellation buffer in minutes (2 hours)
};

// Space Constraints
export const SPACE_CONSTRAINTS = {
  MAX_IMAGES: 5,
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 20,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_PRICE_PER_HOUR: 100,
  MAX_PRICE_PER_HOUR: 100000,
  MIN_CAPACITY: 1,
  MAX_CAPACITY: 1000,
  MAX_AMENITIES: 20,
  MAX_PURPOSES: 10
};

// API Response Codes
export const RESPONSE_CODES = {
  // Success Codes (2000-2999)
  SUCCESS: 2000,
  CREATED: 2001,
  ACCEPTED: 202,
  
  // Client Error Codes (4000-4999)
  VALIDATION_ERROR: 4001,
  AUTHENTICATION_ERROR: 4002,
  AUTHORIZATION_ERROR: 4003,
  RESOURCE_NOT_FOUND: 4004,
  CONFLICT: 4005,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Error Codes (5000-5999)
  INTERNAL_ERROR: 5001,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  TIMEOUT: 504,
  
  // Business Logic Codes (6000-6999)
  BOOKING_CONFLICT: 6001,
  SPACE_UNAVAILABLE: 6002,
  INVALID_STATUS_TRANSITION: 6003,
  REFUND_NOT_AVAILABLE: 6004,
  PAYMENT_REQUIRED: 6005
};

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_PHONE: 'Please provide a valid phone number',
    INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    REQUIRED_FIELD: (field) => `${field} is required`,
    INVALID_FORMAT: (field) => `${field} format is invalid`,
    OUT_OF_RANGE: (field, min, max) => `${field} must be between ${min} and ${max}`
  },
  
  AUTHENTICATION: {
    TOKEN_EXPIRED: 'Authentication token has expired',
    TOKEN_INVALID: 'Invalid authentication token',
    CREDENTIALS_INVALID: 'Invalid email or password',
    ACCOUNT_DISABLED: 'Account is disabled',
    PERMISSION_DENIED: 'You do not have permission to perform this action'
  },
  
  BOOKING: {
    NOT_FOUND: 'Booking not found',
    ALREADY_BOOKED: 'This time slot is already booked',
    INVALID_TIME_RANGE: 'End time must be after start time',
    PAST_TIME_BOOKING: 'Cannot book in the past',
    SPACE_UNAVAILABLE: 'Space is not available for the selected time',
    STATUS_TRANSITION_INVALID: (from, to) => `Cannot change status from ${from} to ${to}`,
    CANCELLATION_NOT_ALLOWED: 'Booking cannot be cancelled at this time',
    REFUND_NOT_AVAILABLE: 'Refund not available for this booking'
  },
  
  SPACE: {
    NOT_FOUND: 'Space not found',
    OWNERSHIP_REQUIRED: 'You can only manage your own spaces',
    MAX_IMAGES_REACHED: 'Maximum number of images reached',
    INVALID_PRICE: 'Invalid price per hour',
    INVALID_CAPACITY: 'Invalid capacity',
    TITLE_TOO_SHORT: 'Title must be at least 5 characters',
    DESCRIPTION_TOO_SHORT: 'Description must be at least 20 characters'
  },
  
  SYSTEM: {
    INTERNAL_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database operation failed',
    EXTERNAL_SERVICE_ERROR: 'External service temporarily unavailable',
    RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later'
  }
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
};

// Cache TTL Constants (in seconds)
export const CACHE_TTL = {
  SPACE_SEARCH: 300, // 5 minutes
  USER_PROFILE: 600, // 10 minutes
  BOOKING_HISTORY: 180, // 3 minutes
  SPACE_DETAILS: 120, // 2 minutes
  POPULAR_SPACES: 600 // 10 minutes
};

// Rate Limiting Constants
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5, // 5 attempts per window
    BLOCK_DURATION: 30 * 60 * 1000 // 30 minutes block
  },
  
  BOOKING: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 10, // 10 bookings per minute
    BLOCK_DURATION: 5 * 60 * 1000 // 5 minutes block
  },
  
  SEARCH: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 60, // 60 searches per minute
    BLOCK_DURATION: 2 * 60 * 1000 // 2 minutes block
  },
  
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000, // 1000 requests per 15 minutes
    BLOCK_DURATION: 15 * 60 * 1000 // 15 minutes block
  }
};

// File Upload Constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
};

// Validation Schemas (for Joi)
export const VALIDATION_SCHEMAS = {
  EMAIL: {
    type: 'string',
    email: true,
    lowercase: true,
    trim: true
  },
  
  PHONE: {
    type: 'string',
    pattern: /^[\+]?[1-9][\d]{0,15}$/
  },
  
  PASSWORD: {
    type: 'string',
    min: 8,
    max: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  
  PRICE: {
    type: 'number',
    min: SPACE_CONSTRAINTS.MIN_PRICE_PER_HOUR,
    max: SPACE_CONSTRAINTS.MAX_PRICE_PER_HOUR
  },
  
  CAPACITY: {
    type: 'number',
    integer: true,
    min: SPACE_CONSTRAINTS.MIN_CAPACITY,
    max: SPACE_CONSTRAINTS.MAX_CAPACITY
  }
};

// Business Logic Helpers
export const BUSINESS_RULES = {
  isBookingStatusTerminal: (status) => {
    return [
      BOOKING_STATUSES.COMPLETED,
      BOOKING_STATUSES.CANCELLED,
      BOOKING_STATUSES.REJECTED
    ].includes(status);
  },
  
  canCancelBooking: (booking) => {
    const hoursUntilStart = (booking.startTime - new Date()) / (1000 * 60 * 60);
    return hoursUntilStart > (REFUND_POLICY.NO_REFUND_HOURS / 60);
  },
  
  isBookingActive: (booking) => {
    const now = new Date();
    return (
      booking.status !== BOOKING_STATUSES.CANCELLED &&
      booking.status !== BOOKING_STATUSES.REJECTED &&
      booking.startTime > now
    );
  },
  
  getBookingProgress: (booking) => {
    const now = new Date();
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    
    if (now < start) return 0; // Not started
    if (now > end) return 100; // Completed
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  }
};

// Export all constants as a single object for easy importing
export default {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TRANSITIONS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  SPACE_STATUSES,
  SPACE_STATUS_LABELS,
  USER_ROLES,
  USER_ROLE_LABELS,
  REFUND_POLICY,
  calculateRefundAmount,
  BOOKING_CONSTRAINTS,
  SPACE_CONSTRAINTS,
  RESPONSE_CODES,
  ERROR_MESSAGES,
  PAGINATION,
  CACHE_TTL,
  RATE_LIMITS,
  FILE_UPLOAD,
  VALIDATION_SCHEMAS,
  BUSINESS_RULES,
  isValidBookingStatusTransition
};