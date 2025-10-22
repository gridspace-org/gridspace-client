import express from 'express';
import rateLimit from 'express-rate-limit';
const router = express.Router();
import {
  signup,
  signin,
  getProfile,
  updateProfile,
  completeOnboarding,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetOtp,
  requestEmailVerification,
  verifyEmail,
  resendEmailVerification,
  logout,
  refreshToken,
  deleteAccount,
  googleAuth,
  getGoogleAuthUrlController,
  googleCallback,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../config/multer.js';

// Security rate limiting configurations
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many authentication attempts. Try again in 15 minutes.'
  }
});

const moderateAuthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 attempts per minute per IP
  message: {
    success: false,
    message: 'Too many requests. Please slow down.'
  }
});

const gentleAuthLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 attempts per 10 minutes per IP
  message: {
    success: false,
    message: 'Too many requests. Try again later.'
  }
});

// Public routes
router.post("/signup", moderateAuthLimiter, upload.single("profilePic"), signup);
router.post("/signin", strictAuthLimiter, signin);
router.post("/request-password-reset", moderateAuthLimiter, requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/request-email-verification", gentleAuthLimiter, requestEmailVerification);
router.post("/verify-email", verifyEmail);
router.post("/resend-email-verification", resendEmailVerification);
router.post("/verify-password-reset-otp", gentleAuthLimiter, verifyPasswordResetOtp);

// Google OAuth routes
router.post("/google", googleAuth);
router.get("/google/url", getGoogleAuthUrlController);
router.get("/google/callback", googleCallback);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, upload.single("profilePic"), updateProfile);
router.post("/onboarding", authenticate, upload.single("profilePic"), completeOnboarding);
router.put("/change-password", authenticate, changePassword);
router.post("/logout", authenticate, logout);
router.post("/refresh-token", authenticate, refreshToken);
router.delete("/account", authenticate, deleteAccount);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

export default router;
