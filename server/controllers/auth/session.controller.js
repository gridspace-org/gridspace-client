import authService from '../../services/auth/auth.service.js';
import { setTokenCookies, clearTokenCookies } from './auth.utils.js';
import logger from '../../config/logger.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * @desc    Sign in user and generate tokens
 * @route   POST /api/v1/auth/signin
 * @access  Public
 */
export const signin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const requestInfo = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown'
    };

    // Use service for login logic
    const result = await authService.login({ email, password }, requestInfo);

    // Set cookies
    if (result.data.tokens) {
      setTokenCookies(res, result.data.tokens.accessToken, result.data.tokens.refreshToken);
    }

    // Send response
    res.status(200).json(result);
  } catch (error) {
    logger.error('Signin controller failed', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      ipAddress: req.ip
    });
    throw error;
  }
});

/**
 * @desc    Logout user / clear cookies
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    // Use service for logout logic
    const result = await authService.logout(refreshToken, req.user);

    // Clear cookies
    clearTokenCookies(res);

    // Send response
    res.status(200).json(result);
  } catch (error) {
    logger.error('Logout controller failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    throw error;
  }
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public - requires refresh token in cookies
 */
export const refreshToken = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    // Validate input
    if (!refreshToken) {
      throw new AppError('No refresh token provided', 401);
    }

    // Use service for token refresh logic
    const result = await authService.refreshToken(refreshToken);

    // Set new cookies
    if (result.data) {
      setTokenCookies(res, result.data.accessToken, result.data.refreshToken);
    }

    // Send response
    res.status(200).json(result);
  } catch (error) {
    // Clear cookies on error
    clearTokenCookies(res);
    
    logger.error('Token refresh controller failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    // Use service for profile retrieval
    const result = await authService.getProfile(req.user._id);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get current user controller failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    throw error;
  }
});
