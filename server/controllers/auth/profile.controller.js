import User from '../../models/User.model.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { uploadProfileImage } from './auth.utils.js';

export const getProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    user: req.user,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { fullname, phoneNumber } = req.body;
  const userId = req.user._id;

  if (!fullname && !phoneNumber && !req.file) {
    throw new AppError('Please provide at least one field to update', 400);
  }

  const updateData = {};

  if (phoneNumber && phoneNumber !== req.user.phoneNumber) {
    const normalizedPhone = phoneNumber.trim();
    const existingPhone = await User.findOne({ phoneNumber: normalizedPhone, _id: { $ne: userId } });
    if (existingPhone) {
      throw new AppError('Phone number already exists', 400);
    }
    updateData.phoneNumber = normalizedPhone;
  }

  if (fullname) {
    updateData.fullname = fullname.trim();
  }

  if (req.file) {
    updateData.profilePic = await uploadProfileImage(req.file);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current password and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400);
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { role, purposes, location } = req.body;

  if (!role) {
    throw new AppError('Role is required for onboarding', 400);
  }

  const validRoles = ['user', 'host', 'admin'];
  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role. Must be one of: user, host, admin', 400);
  }

  let parsedPurposes = [];
  if (purposes) {
    try {
      parsedPurposes = typeof purposes === 'string' ? JSON.parse(purposes) : purposes;
      if (!Array.isArray(parsedPurposes)) {
        parsedPurposes = [];
      }
    } catch (error) {
      throw new AppError('Invalid purposes format. Must be a valid JSON array', 400);
    }
  }

  const updateData = {
    role: role.trim(),
    onboardingCompleted: true,
    purposes: parsedPurposes,
  };

  if (location) {
    updateData.location = location.trim();
  }

  if (req.file) {
    updateData.profilePic = await uploadProfileImage(req.file);
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Onboarding completed successfully',
    user: updatedUser,
  });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { password } = req.body;

  if (!password) {
    throw new AppError('Please provide password to confirm account deletion', 400);
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Incorrect password', 400);
  }

  await User.findByIdAndDelete(req.user._id);

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});
