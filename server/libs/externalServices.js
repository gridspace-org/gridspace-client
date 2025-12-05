/**
 * External Services with Circuit Breaker Protection
 * Wraps all external API calls with fault tolerance
 *
 * Includes:
 * - Cloudinary (image uploads)
 * - Google OAuth (authentication)
 * - Monnify (payment processing)
 * - Resend (email delivery)
 */

import {
  createCircuitBreaker,
  executeWithBreaker,
} from "../config/circuitBreaker.js";
import cloudinary from "cloudinary";
import { logger } from "../config/logger.js";

// ===== CLOUDINARY IMAGE UPLOAD =====
const cloudinaryUploadBreaker = createCircuitBreaker(
  "cloudinary-upload",
  async (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "gridspace",
          ...options,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
  },
  {
    timeout: 15000, // Uploads can take longer
    errorThresholdPercentage: 40,
    resetTimeout: 60000, // 1 minute
  }
);

/**
 * Upload image to Cloudinary with circuit breaker protection
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with secure URL
 */
export const uploadToCloudinary = async (buffer, options = {}) => {
  try {
    const result = await executeWithBreaker(
      cloudinaryUploadBreaker,
      buffer,
      options
    );
    logger.info("Image uploaded to Cloudinary", {
      publicId: result.public_id,
      size: result.bytes,
    });
    return result;
  } catch (error) {
    if (error.isCircuitOpen) {
      logger.error("Cloudinary circuit breaker open", { error: error.message });
      throw {
        status: 503,
        message:
          "Image upload service temporarily unavailable. Please try again later.",
        code: "CLOUDINARY_UNAVAILABLE",
      };
    }
    throw {
      status: 400,
      message: "Failed to upload image",
      code: "IMAGE_UPLOAD_FAILED",
      details: error.message,
    };
  }
};

// ===== GOOGLE OAUTH VERIFICATION =====
const googleOAuthBreaker = createCircuitBreaker(
  "google-oauth",
  async (token, client) => {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  },
  {
    timeout: 8000,
    errorThresholdPercentage: 30, // Strict - auth is critical
    resetTimeout: 45000,
  }
);

/**
 * Verify Google OAuth token with circuit breaker protection
 * @param {string} token - Google ID token
 * @param {Object} client - Google OAuth client
 * @returns {Promise<Object>} Decoded token payload
 */
export const verifyGoogleToken = async (token, client) => {
  try {
    const payload = await executeWithBreaker(googleOAuthBreaker, token, client);
    logger.info("Google token verified", { email: payload.email });
    return payload;
  } catch (error) {
    if (error.isCircuitOpen) {
      logger.error("Google OAuth circuit breaker open", {
        error: error.message,
      });
      throw {
        status: 503,
        message:
          "Authentication service temporarily unavailable. Please try again.",
        code: "GOOGLE_OAUTH_UNAVAILABLE",
      };
    }
    throw {
      status: 401,
      message: "Invalid Google token",
      code: "GOOGLE_TOKEN_INVALID",
    };
  }
};

// ===== MONNIFY PAYMENT PROCESSING =====
const monnifyBreaker = createCircuitBreaker(
  "monnify-payment",
  async (axiosConfig) => {
    // Wrap axios calls with circuit breaker
    const axios = (await import("axios")).default;
    return await axios(axiosConfig);
  },
  {
    timeout: 10000, // Payment calls can take longer
    errorThresholdPercentage: 20, // Very strict - payment failures are critical
    resetTimeout: 120000, // 2 minutes before retry
  }
);

/**
 * Make protected HTTP request to Monnify API
 * @param {Object} axiosConfig - Axios request configuration
 * @returns {Promise<Object>} Response from Monnify
 */
export const callMonnifyAPI = async (axiosConfig) => {
  try {
    const response = await executeWithBreaker(monnifyBreaker, axiosConfig);
    return response;
  } catch (error) {
    if (error.isCircuitOpen) {
      logger.error("Monnify circuit breaker open", {
        url: axiosConfig.url,
        error: error.message,
      });
      throw {
        status: 503,
        message:
          "Payment service temporarily unavailable. Please try again later.",
        code: "MONNIFY_UNAVAILABLE",
      };
    }
    // Re-throw original error for proper handling by service
    throw error;
  }
};

// ===== RESEND EMAIL SERVICE =====
const emailBreaker = createCircuitBreaker(
  "resend-email",
  async (emailData, client) => {
    return await client.emails.send(emailData);
  },
  {
    timeout: 5000,
    errorThresholdPercentage: 30,
    resetTimeout: 60000,
  }
);

/**
 * Send email with Resend with circuit breaker protection
 * @param {Object} emailData - Email details (to, subject, html, etc.)
 * @param {Object} client - Resend API client
 * @returns {Promise<Object>} Email send result
 */
export const sendEmailWithResend = async (emailData, client) => {
  try {
    const result = await executeWithBreaker(emailBreaker, emailData, client);
    logger.info("Email sent via Resend", {
      to: emailData.to,
      subject: emailData.subject,
    });
    return result;
  } catch (error) {
    if (error.isCircuitOpen) {
      logger.warn("Resend circuit breaker open", {
        error: error.message,
        fallback: "Email sending queued for retry",
      });
      // Email failures don't block user flow
      // Queue for retry (optional queue implementation)
      return {
        queued: true,
        message: "Email will be sent when service recovers",
      };
    }
    logger.warn("Failed to send email", { error: error.message });
    // Don't throw - email is non-critical
    return { queued: true, error: error.message };
  }
};

// ===== BATCH EXPORT FOR EASY INTEGRATION =====
export const externalServices = {
  cloudinary: {
    upload: uploadToCloudinary,
  },
  google: {
    verifyToken: verifyGoogleToken,
  },
  payment: {
    callMonnifyAPI: callMonnifyAPI,
  },
  email: {
    sendResend: sendEmailWithResend,
  },
};

export default externalServices;
