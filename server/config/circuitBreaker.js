/**
 * Circuit Breaker Configuration
 * Implements fault tolerance for external service calls
 * Prevents cascading failures and provides graceful degradation
 *
 * Pattern: Closed → Open → Half-Open → Closed
 * - Closed: Normal operation
 * - Open: Service failing, reject immediately
 * - Half-Open: Testing if service recovered
 */

import CircuitBreaker from "opossum";
import { logger } from "./logger.js";

// ===== CIRCUIT BREAKER OPTIONS =====
const defaultOptions = {
  timeout: 5000, // 5 second timeout per request
  errorThresholdPercentage: 50, // Trip if 50% of requests fail
  resetTimeout: 30000, // Try recovery after 30 seconds
  name: "default-breaker",
  rollingCountTimeout: 10000, // Count failures in 10 second windows
  rollingCountBuckets: 10, // 10 buckets of 1 second each
};

/**
 * Create a new circuit breaker with standardized configuration
 * @param {string} serviceName - Name of the external service
 * @param {Function} fn - Async function to wrap
 * @param {Object} options - Override default options
 * @returns {CircuitBreaker} Configured circuit breaker instance
 */
export const createCircuitBreaker = (serviceName, fn, options = {}) => {
  const config = { ...defaultOptions, name: serviceName, ...options };

  const breaker = new CircuitBreaker(fn, config);

  // Log state transitions
  breaker.on("open", () => {
    logger.warn(`Circuit breaker OPEN: ${serviceName}`, {
      service: serviceName,
      reason: "Error threshold exceeded",
      timestamp: new Date().toISOString(),
    });
  });

  breaker.on("halfOpen", () => {
    logger.info(`Circuit breaker HALF-OPEN: ${serviceName}`, {
      service: serviceName,
      reason: "Testing recovery",
      timestamp: new Date().toISOString(),
    });
  });

  breaker.on("close", () => {
    logger.info(`Circuit breaker CLOSED: ${serviceName}`, {
      service: serviceName,
      reason: "Service recovered",
      timestamp: new Date().toISOString(),
    });
  });

  // Log failures
  breaker.on("failure", (result) => {
    logger.error(`Circuit breaker failure: ${serviceName}`, {
      service: serviceName,
      error: result?.message || result,
      state: breaker.opened ? "OPEN" : "CLOSED",
    });
  });

  // Log successes in half-open state (recovery)
  breaker.on("success", () => {
    if (breaker.halfOpen) {
      logger.info(`Circuit breaker recovered: ${serviceName}`, {
        service: serviceName,
        recoveredAt: new Date().toISOString(),
      });
    }
  });

  return breaker;
};

/**
 * Execute function with circuit breaker protection
 * @param {CircuitBreaker} breaker - Circuit breaker instance
 * @param {Array} args - Arguments to pass to breaker function
 * @returns {Promise} Result from function or circuit breaker error
 */
export const executeWithBreaker = async (breaker, ...args) => {
  try {
    return await breaker.fire(...args);
  } catch (error) {
    if (error.message.includes("breaker is open")) {
      throw {
        isCircuitOpen: true,
        message: `Service temporarily unavailable (circuit breaker open)`,
        originalError: error.message,
      };
    }
    throw error;
  }
};

/**
 * Get circuit breaker metrics
 * Useful for monitoring and debugging
 * @param {CircuitBreaker} breaker - Circuit breaker instance
 * @returns {Object} Metrics object
 */
export const getBreakerMetrics = (breaker) => {
  return {
    name: breaker.name,
    state: breaker.opened ? "OPEN" : breaker.halfOpen ? "HALF-OPEN" : "CLOSED",
    stats: breaker.stats,
    fallback: breaker.fallback ? "enabled" : "disabled",
    timeout: breaker.timeout,
    errorThresholdPercentage: breaker.options.errorThresholdPercentage,
  };
};

// ===== SERVICE-SPECIFIC BREAKERS =====

/**
 * Cloudinary Image Upload Breaker
 * Handles image uploads to CDN
 */
export const createCloudinaryBreaker = () => {
  return createCircuitBreaker(
    "cloudinary-upload",
    async (imageBuffer, options = {}) => {
      const cloudinary = require("cloudinary").v2;
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: process.env.CLOUDINARY_FOLDER || "gridspace",
            ...options,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(imageBuffer);
      });
    },
    {
      timeout: 10000, // Image uploads can take longer
      errorThresholdPercentage: 40, // More lenient for uploads
      resetTimeout: 60000, // Wait 1 minute before retry
    }
  );
};

/**
 * Google OAuth Breaker
 * Handles user authentication via Google
 */
export const createGoogleOAuthBreaker = () => {
  return createCircuitBreaker(
    "google-oauth",
    async (credential) => {
      const { verifyIdToken } = require("google-auth-library");
      return await verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    },
    {
      timeout: 8000, // Auth should be fast
      errorThresholdPercentage: 30, // Stricter - auth is critical
      resetTimeout: 45000, // 45 seconds before retry
    }
  );
};

/**
 * Monnify Payment Gateway Breaker
 * Handles payment processing
 */
export const createMonnifyBreaker = () => {
  return createCircuitBreaker(
    "monnify-payment",
    async (paymentData) => {
      // Actual implementation depends on Monnify SDK
      // This is a template
      const response = await fetch(
        process.env.MONNIFY_API_URL || "https://api.monnify.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MONNIFY_SECRET_KEY}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        throw new Error(`Monnify error: ${response.statusText}`);
      }

      return await response.json();
    },
    {
      timeout: 15000, // Payments can take time
      errorThresholdPercentage: 20, // Very strict - payments are critical
      resetTimeout: 120000, // 2 minutes before retry
      name: "monnify-payment",
    }
  );
};

/**
 * Resend Email Service Breaker
 * Handles email sending (verification, notifications)
 */
export const createResendEmailBreaker = () => {
  return createCircuitBreaker(
    "resend-email",
    async (emailData) => {
      const { Resend } = require("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      return await resend.emails.send(emailData);
    },
    {
      timeout: 10000, // Email API timeout
      errorThresholdPercentage: 50, // More lenient - emails aren't blocking
      resetTimeout: 90000, // 1.5 minutes before retry
    }
  );
};

/**
 * MongoDB Query Breaker (Optional)
 * For protecting against slow database queries
 */
export const createMongoBreaker = () => {
  return createCircuitBreaker(
    "mongodb-query",
    async (queryFn) => {
      return await queryFn();
    },
    {
      timeout: 5000, // DB queries should be < 5s
      errorThresholdPercentage: 30, // Stricter - DB is core
      resetTimeout: 60000, // 1 minute before retry
    }
  );
};

// ===== GLOBAL CIRCUIT BREAKER POOL =====
// Initialize all breakers on app startup
const circuitBreakers = new Map();

export const initializeCircuitBreakers = () => {
  circuitBreakers.set("cloudinary", createCloudinaryBreaker());
  circuitBreakers.set("googleOAuth", createGoogleOAuthBreaker());
  circuitBreakers.set("monnify", createMonnifyBreaker());
  circuitBreakers.set("resendEmail", createResendEmailBreaker());
  circuitBreakers.set("mongodb", createMongoBreaker());

  logger.info("✅ All circuit breakers initialized");
};

/**
 * Get a circuit breaker by name
 * @param {string} name - Breaker name (cloudinary, googleOAuth, monnify, resendEmail, mongodb)
 * @returns {CircuitBreaker} Circuit breaker instance
 */
export const getCircuitBreaker = (name) => {
  const breaker = circuitBreakers.get(name);
  if (!breaker) {
    logger.error(`Circuit breaker not found: ${name}`);
    throw new Error(`Unknown circuit breaker: ${name}`);
  }
  return breaker;
};

/**
 * Get all circuit breaker metrics for monitoring
 * @returns {Object} Map of all breaker metrics
 */
export const getAllBreakerMetrics = () => {
  const metrics = {};
  for (const [name, breaker] of circuitBreakers.entries()) {
    metrics[name] = getBreakerMetrics(breaker);
  }
  return metrics;
};

/**
 * Health check endpoint data
 * Shows which external services are available
 * @returns {Object} Service health status
 */
export const getServiceHealthStatus = () => {
  const status = {};
  for (const [name, breaker] of circuitBreakers.entries()) {
    status[name] = {
      available: !breaker.opened,
      state: breaker.opened
        ? "OPEN"
        : breaker.halfOpen
        ? "HALF-OPEN"
        : "CLOSED",
      failureRate: breaker.stats?.fires
        ? ((breaker.stats.failures / breaker.stats.fires) * 100).toFixed(2) +
          "%"
        : "N/A",
    };
  }
  return status;
};

export default {
  createCircuitBreaker,
  executeWithBreaker,
  getBreakerMetrics,
  initializeCircuitBreakers,
  getCircuitBreaker,
  getAllBreakerMetrics,
  getServiceHealthStatus,
};
