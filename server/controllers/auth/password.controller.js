import bcrypt from 'bcrypt';
import PasswordReset from '../../models/PasswordReset.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { generateSecureOTP, verifyOTP, isOTPExpired } from '../../services/otpService.js';
import emailService from '../../services/emailService.js';
import User from '../../models/User.model.js';

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide email address', 400);
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError('User with this email does not exist', 404);
  }

  const { otp, expiresAt } = generateSecureOTP(6, 60);

  await PasswordReset.create({
    email: normalizedEmail,
    token: otp,
    expiresAt,
  });

  const emailResult = await emailService.sendPasswordResetEmail(normalizedEmail, otp, user.fullname);

  if (!emailResult.success) {
    await PasswordReset.deleteOne({ email: normalizedEmail, token: otp });
    throw new AppError('Failed to send password reset email. Please try again.', 500, { details: emailResult.error });
  }

  res.status(200).json({
    success: true,
    message: 'Password reset email sent to your email address',
  });
});

export const verifyPasswordResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError('Please provide email and OTP', 400);
  }

  const record = await PasswordReset.findOne({
    email: email.toLowerCase(),
    token: otp,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    throw new AppError('Invalid or expired verification code', 400);
  }

  res.status(200).json({
    success: true,
    message: 'OTP verified',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError('Please provide reset token and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400);
  }

  const passwordReset = await PasswordReset.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!passwordReset) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const user = await User.findOne({ email: passwordReset.email });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await User.findByIdAndUpdate(user._id, {
    password: hashedPassword,
    ...(user.authProvider ? {} : { authProvider: 'local' })
  }, {
    new: true,
    runValidators: false
  });

  passwordReset.used = true;
  await passwordReset.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});
