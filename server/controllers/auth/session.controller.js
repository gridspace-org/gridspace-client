import User from '../../models/User.model.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyToken, 
  setTokenCookies, 
  clearTokenCookies 
} from './auth.utils.js';
import logger from '../../config/logger.js';

/**
 * @desc    Sign in user and generate tokens
 * @route   POST /api/v1/auth/signin
 * @access  Public
 */
export const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +refreshTokens');
  
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  // 3) Generate tokens
  const accessToken = generateToken(user._id, 'access');
  const refreshToken = generateRefreshToken();

  // 4) Save refresh token to database
  user.refreshTokens.push({
    token: refreshToken.token,
    expiresAt: refreshToken.expiresAt,
    userAgent: req.get('user-agent') || 'unknown',
    ipAddress: req.ip || req.connection.remoteAddress
  });
  
  await user.save({ validateBeforeSave: false });

  // 5) Set cookies
  setTokenCookies(res, accessToken, refreshToken.token);

  // 6) Remove sensitive data from response
  user.password = undefined;
  user.refreshTokens = undefined;

  // 7) Send response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      accessToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    }
  });
});

/**
 * @desc    Logout user / clear cookies
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  
  // 1) Clear refresh token from database
  if (refreshToken) {
    await User.updateOne(
      { 'refreshTokens.token': refreshToken },
      { $pull: { refreshTokens: { token: refreshToken } } }
    );
  }

  // 2) Clear cookies
  clearTokenCookies(res);

  // 3) Send response
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public - requires refresh token in cookies
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  
  // 1) Check if refresh token exists
  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  // 2) Find user with the refresh token
  const user = await User.findOne({
    'refreshTokens.token': refreshToken,
    'refreshTokens.expiresAt': { $gt: new Date() }
  });

  if (!user) {
    // Clear invalid refresh token
    clearTokenCookies(res);
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // 3) Generate new tokens
  const newAccessToken = generateToken(user._id, 'access');
  const newRefreshToken = generateRefreshToken();

  // 4) Update refresh token in database (rotation)
  user.refreshTokens = user.refreshTokens.map(token => 
    token.token === refreshToken 
      ? { 
          ...token, 
          token: newRefreshToken.token, 
          expiresAt: newRefreshToken.expiresAt,
          lastUsedAt: new Date()
        }
      : token
  );
  
  await user.save({ validateBeforeSave: false });

  // 5) Set new cookies
  setTokenCookies(res, newAccessToken, newRefreshToken.token);

  // 6) Send response
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: newAccessToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    }
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});
