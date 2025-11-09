import EmailVerification from '../../models/EmailVerification.js';
import User from '../../models/User.model.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { generateSecureOTP, verifyOTP, isOTPExpired } from '../../services/otpService.js';
import emailService from '../../services/emailService.js';

const MAX_ATTEMPTS = 3;

export const requestEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide email address', 400);
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError('User with this email does not exist', 404);
  }

  if (user.emailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  const existingVerification = await EmailVerification.findOne({
    email: normalizedEmail,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (existingVerification) {
    if (existingVerification.attempts >= MAX_ATTEMPTS) {
      throw new AppError('Maximum verification attempts exceeded. Please try again later.', 429);
    }

    return res.status(200).json({
      success: true,
      message: 'Verification OTP already sent. Please check your email.',
      remainingAttempts: MAX_ATTEMPTS - existingVerification.attempts,
    });
  }

  const { otp, expiresAt } = generateSecureOTP(6, 10);

  await EmailVerification.deleteMany({ email: normalizedEmail });

  await EmailVerification.create({
    email: normalizedEmail,
    otp,
    expiresAt,
  });

  const emailResult = await emailService.sendOTPEmail(normalizedEmail, otp, user.fullname);

  if (!emailResult.success) {
    await EmailVerification.deleteOne({ email: normalizedEmail, otp });
    throw new AppError('Failed to send verification email. Please try again.', 500, { details: emailResult.error });
  }

  res.status(200).json({
    success: true,
    message: 'Verification OTP sent to your email address',
    remainingAttempts: MAX_ATTEMPTS,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError('Please provide email address and OTP', 400);
  }

  const normalizedEmail = email.toLowerCase();

  const record = await EmailVerification.findOne({
    email: normalizedEmail,
    verified: false,
  });

  if (!record) {
    throw new AppError('No verification request found for this email. Please request a new OTP.', 400);
  }

  if (isOTPExpired(record.expiresAt)) {
    await EmailVerification.deleteOne({ _id: record._id });
    throw new AppError('OTP has expired. Please request a new verification code.', 400);
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new AppError('Maximum verification attempts exceeded. Please request a new OTP.', 429);
  }

  const verificationResult = verifyOTP(otp, record.otp, record.expiresAt);

  if (!verificationResult.success) {
    record.attempts += 1;
    await record.save();

    throw new AppError(verificationResult.message, 400, {
      details: { remainingAttempts: Math.max(MAX_ATTEMPTS - record.attempts, 0) }
    });
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  record.verified = true;
  await record.save();

  user.emailVerified = true;
  await user.save();

  await EmailVerification.deleteOne({ _id: record._id });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

export const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide email address', 400);
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError('User with this email does not exist', 404);
  }

  if (user.emailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  await EmailVerification.deleteMany({ email: normalizedEmail });

  const { otp, expiresAt } = generateSecureOTP(6, 10);

  await EmailVerification.create({
    email: normalizedEmail,
    otp,
    expiresAt,
  });

  const emailResult = await emailService.sendOTPEmail(normalizedEmail, otp, user.fullname);

  if (!emailResult.success) {
    await EmailVerification.deleteOne({ email: normalizedEmail, otp });
    throw new AppError('Failed to send verification email. Please try again.', 500, { details: emailResult.error });
  }

  res.status(200).json({
    success: true,
    message: 'Verification email resent successfully',
  });
});
