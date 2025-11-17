import authService from '../../services/auth/auth.service.js';
import logger from '../../config/logger.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  try {
    const { email, password, fullname, phonenumber, role } = req.body;

    // Validate input
    if (!email || !password || !fullname) {
      throw new AppError('Please provide email, password, and full name', 400);
    }

    const requestInfo = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown'
    };

    // Use service for registration logic
    const result = await authService.register(
      { email, password, fullname, phonenumber, role },
      requestInfo
    );

    // Send response
    res.status(201).json(result);
  } catch (error) {
    logger.error('Signup controller failed', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      ipAddress: req.ip
    });
    throw error;
  }
});
