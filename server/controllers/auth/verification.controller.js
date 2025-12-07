import authService from '../../services/auth/auth.service.js';
import logger from '../../config/logger.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * @desc    Request email verification
 * @route   POST /api/v1/auth/verify-email/request
 * @access  Private
 */
export const requestEmailVerification = asyncHandler(async (req, res) => {
  try {
    // Use service for email verification request
    const result = await authService.requestEmailVerification(req.user._id);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Request email verification controller failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    throw error;
  }
});

/**
 * @desc    Verify email with OTP
 * @route   POST /api/v1/auth/verify-email
 * @access  Private
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { otp } = req.body;

    // Validate input
    if (!otp) {
      throw new AppError('Please provide OTP code', 400);
    }

    // Use service for email verification
    const result = await authService.verifyEmail(req.user._id, otp);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Verify email controller failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    throw error;
  }
});

/**
 * @desc    Resend email verification
 * @route   POST /api/v1/auth/verify-email/resend
 * @access  Private
 */
export const resendEmailVerification = asyncHandler(async (req, res) => {
  try {
    // Use service for email verification request (same as requestEmailVerification)
    const result = await authService.requestEmailVerification(req.user._id);
    
    res.status(200).json({
      ...result,
      message: 'Verification email resent successfully'
    });
  } catch (error) {
    logger.error('Resend email verification controller failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    throw error;
  }
});
