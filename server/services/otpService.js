const crypto = require('crypto');

/**
 * Generate a random OTP (One-Time Password)
 * @param {number} length - Length of the OTP (default: 6)
 * @returns {string} Generated OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
};

/**
 * Generate a secure OTP with expiration time
 * @param {number} length - Length of the OTP (default: 6)
 * @param {number} expiryMinutes - Expiry time in minutes (default: 10)
 * @returns {Object} Object containing OTP, expiry time, and creation time
 */
const generateSecureOTP = (length = 6, expiryMinutes = 10) => {
  const otp = generateOTP(length);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + (expiryMinutes * 60 * 1000));
  
  return {
    otp,
    createdAt,
    expiresAt,
    expiryMinutes
  };
};

/**
 * Verify if an OTP is valid and not expired
 * @param {string} providedOTP - OTP provided by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} expiresAt - Expiry time of the OTP
 * @returns {Object} Verification result with success status and message
 */
const verifyOTP = (providedOTP, storedOTP, expiresAt) => {
  // Check if OTP is expired
  if (new Date() > new Date(expiresAt)) {
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.',
      expired: true
    };
  }
  
  // Check if OTP matches
  if (providedOTP !== storedOTP) {
    return {
      success: false,
      message: 'Invalid OTP. Please check and try again.',
      expired: false
    };
  }
  
  return {
    success: true,
    message: 'OTP verified successfully',
    expired: false
  };
};

/**
 * Check if OTP is expired without verifying the code
 * @param {Date} expiresAt - Expiry time of the OTP
 * @returns {boolean} True if expired, false otherwise
 */
const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

/**
 * Get remaining time for OTP in minutes
 * @param {Date} expiresAt - Expiry time of the OTP
 * @returns {number} Remaining time in minutes (0 if expired)
 */
const getRemainingTime = (expiresAt) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  
  if (now >= expiry) {
    return 0;
  }
  
  return Math.ceil((expiry - now) / (1000 * 60));
};

module.exports = {
  generateOTP,
  generateSecureOTP,
  verifyOTP,
  isOTPExpired,
  getRemainingTime
};
