import User from "../../models/User.model.js";
import AppError from "../../utils/AppError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { generateToken, generateRefreshToken, uploadProfileImage, setTokenCookies } from "./auth.utils.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signup = asyncHandler(async (req, res) => {
  const { fullname, email, password, phonenumber } = req.body;

  if (!fullname || !email || !password || !phonenumber) {
    throw new AppError(
      "Please provide all required fields: fullname, email, password, phonenumber",
      400
    );
  }

  if (!emailRegex.test(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phonenumber.trim();

  const [existingUser, existingPhone] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    User.findOne({ phonenumber: normalizedPhone }),
  ]);

  if (existingUser) {
    throw new AppError("User with this email already exists", 400);
  }

  if (existingPhone) {
    throw new AppError("User with this phone number already exists", 400);
  }

  const profilePic = await uploadProfileImage(req.file);

  const user = await User.create({
    fullname: fullname.trim(),
    email: normalizedEmail,
    password,
    phonenumber: normalizedPhone,
    profilePic,
  });

  // Generate tokens
  const accessToken = generateToken(user._id, 'access');
  const refreshToken = generateRefreshToken();

  // Save refresh token to database
  user.refreshTokens.push({
    token: refreshToken.token,
    expiresAt: refreshToken.expiresAt,
    userAgent: req.get('user-agent') || 'unknown',
    ipAddress: req.ip || req.connection.remoteAddress
  });
  
  await user.save({ validateBeforeSave: false });

  // Set cookies
  setTokenCookies(res, accessToken, refreshToken.token);

  // Remove sensitive data from response
  user.password = undefined;
  user.refreshTokens = undefined;

  // Send response
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      user,
      accessToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    }
  });
});
