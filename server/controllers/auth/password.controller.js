import authService from '../../services/auth/auth.service.js';
import logger from '../../config/logger.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * @desc    Request password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const requestPasswordReset = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      throw new AppError('Please provide email address', 400);
    }

    // Use service for password reset request
    const result = await authService.requestPasswordReset(email);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Request password reset controller failed', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      ipAddress: req.ip
    });
    throw error;
  }
});

/**
 * @desc    Verify password reset OTP
 * @route   POST /api/v1/auth/verify-reset-otp
 * @access  Public
 */
export const verifyPasswordResetOtp = asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      throw new AppError('Please provide email and OTP code', 400);
    }

    // Use service for OTP verification
    const result = await authService.verifyPasswordResetOtp(email, otp);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Verify password reset OTP controller failed', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      ipAddress: req.ip
    });
    throw error;
  }
});

/**
 * @desc    Reset password with token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      throw new AppError('Please provide reset token and new password', 400);
    }

    // Validate password strength
    if (newPassword.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    // Use service for password reset
    const result = await authService.resetPassword(token, newPassword);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Reset password controller failed', {
      error: error.message,
      stack: error.stack,
      ipAddress: req.ip
    });
    throw error;
  }
});
