import User from '../../models/User.model.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { generateToken, uploadProfileImage } from './auth.utils.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signup = asyncHandler(async (req, res) => {
  const { fullname, email, password, phoneNumber } = req.body;

  if (!fullname || !email || !password || !phoneNumber) {
    throw new AppError('Please provide all required fields: fullname, email, password, phoneNumber', 400);
  }

  if (!emailRegex.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phoneNumber.trim();

  const [existingUser, existingPhone] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    User.findOne({ phoneNumber: normalizedPhone })
  ]);

  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  if (existingPhone) {
    throw new AppError('User with this phone number already exists', 400);
  }

  const profilePic = await uploadProfileImage(req.file);

  const user = await User.create({
    fullname: fullname.trim(),
    email: normalizedEmail,
    password,
    phoneNumber: normalizedPhone,
    profilePic
  });

  const token = generateToken(user._id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user,
  });
});
