import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { verifyGoogleToken, getGoogleAuthUrl, getTokensFromCode } from '../../config/googleAuth.js';
import User from '../../models/User.model.js';
import { generateToken } from './auth.utils.js';

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });
};

const upsertGoogleUser = async (googleUser) => {
  let user = await User.findOne({
    $or: [
      { googleId: googleUser.googleId },
      { email: googleUser.email }
    ]
  });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleUser.googleId;
    }
    user.authProvider = 'google';
    user.emailVerified = googleUser.emailVerified;
    if (googleUser.profilePic && !user.profilePic) {
      user.profilePic = googleUser.profilePic;
    }
    await user.save();
  } else {
    user = await User.create({
      fullname: googleUser.fullname,
      email: googleUser.email,
      googleId: googleUser.googleId,
      authProvider: 'google',
      emailVerified: googleUser.emailVerified,
      profilePic: googleUser.profilePic,
      phoneNumber: googleUser.phoneNumber || null
    });
  }

  return user;
};

export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError('Google ID token is required', 400);
  }

  const googleUser = await verifyGoogleToken(idToken);
  const user = await upsertGoogleUser(googleUser);
  const token = generateToken(user._id);

  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    message: user.googleId ? 'Google signin successful' : 'Google signup successful',
    user,
  });
});

export const getGoogleAuthUrlController = asyncHandler(async (req, res) => {
  const authUrl = getGoogleAuthUrl();

  res.status(200).json({
    success: true,
    message: 'Google auth URL generated',
    authUrl,
  });
});

export const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    throw new AppError('Authorization code is required', 400);
  }

  const googleUser = await getTokensFromCode(code);
  const user = await upsertGoogleUser(googleUser);
  const token = generateToken(user._id);

  setAuthCookie(res, token);

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    throw new AppError('FRONTEND_URL is not configured', 500);
  }

  res.redirect(`${frontendUrl}/auth/callback?success=true`);
});
