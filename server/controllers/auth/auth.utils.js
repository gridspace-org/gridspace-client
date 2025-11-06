import jwt from 'jsonwebtoken';
import streamifier from 'streamifier';
import crypto from 'crypto';
import cloudinary from '../../config/cloudinary.js';
import AppError from '../../utils/AppError.js';
import logger from '../../config/logger.js';

// Token configurations
const TOKEN_CONFIG = {
  access: {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m', // 15 minutes
    type: 'access',
  },
  refresh: {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d', // 7 days
    type: 'refresh',
  },
  issuer: 'gridspace-backend',
  audience: 'gridspace-client'
};

/**
 * Generate a JWT token
 */
export const generateToken = (userId, tokenType = 'access') => {
  const { expiresIn, type, ...options } = TOKEN_CONFIG[tokenType] || TOKEN_CONFIG.access;
  
  return jwt.sign(
    {
      id: userId,
      iat: Math.floor(Date.now() / 1000),
      type
    },
    process.env.JWT_SECRET,
    {
      ...options,
      expiresIn
    }
  );
};

/**
 * Generate a secure random refresh token
 */
export const generateRefreshToken = () => ({
  token: crypto.randomBytes(40).toString('hex'),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
});

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: TOKEN_CONFIG.issuer,
      audience: TOKEN_CONFIG.audience
    });
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`, { error });
    throw new AppError('Invalid or expired token', 401);
  }
};

/**
 * Set token cookies on the response object
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Set access token cookie (15 minutes)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/'
  });

  // Set refresh token cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth/refresh-token'
  });
};

/**
 * Clear token cookies
 */
export const clearTokenCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/'
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/api/v1/auth/refresh-token'
  });
};

const ensureCloudinaryConfig = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    logger.error('Cloudinary configuration missing', {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET
    });
    throw new AppError('Cloudinary configuration is missing. Please check your environment variables.', 500);
  }
};

export const uploadProfileImage = async (file, options = {}) => {
  if (!file) {
    return null;
  }

  ensureCloudinaryConfig();

  const uploadOptions = {
    folder: 'gridspace/profiles',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    ...options
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error('Cloudinary upload error', error);
        reject(new AppError('Failed to upload profile picture', 500, { details: error.message }));
        return;
      }

      logger.info('Cloudinary upload successful', { url: result.secure_url });
      resolve(result.secure_url);
    });

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};
