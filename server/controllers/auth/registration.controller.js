import User from "../../models/User.model.js";
import AppError from "../../utils/AppError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { generateToken, generateRefreshToken, uploadProfileImage, setTokenCookies } from "./auth.utils.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
