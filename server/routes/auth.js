import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import {
  signup,
  signin,
  requestPasswordReset,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
  resendEmailVerification,
  verifyPasswordResetOtp,
  googleCallback,
  getGoogleAuthUrlController,
  googleAuth,
  getProfile,
  updateProfile,
  completeOnboarding,
  changePassword,
  logout,
  refreshToken,
  deleteAccount
} from '../controllers/auth/index.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../config/multer.js';
import validate from '../middleware/validate.js';
import { signupSchema, signinSchema, requestPasswordResetSchema, resetPasswordSchema, verifyEmailSchema, changePasswordSchema, requestEmailVerificationSchema, resendEmailVerificationSchema, verifyPasswordResetOtpSchema, googleAuthSchema, updateProfileSchema, completeOnboardingSchema, deleteAccountSchema } from '../validators/auth.validator.js';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and profile management endpoints
 */

const router = express.Router();

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

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - password
 *               - phonenumber
 *             properties:
 *               fullname:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be unique)
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Password must be at least 6 characters
 *               phonenumber:
 *                 type: string
 *                 description: User's phone number (must be unique)
 *               profilePic:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile picture
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 */
router.post("/signup", moderateAuthLimiter, upload.single("profilePic"), validate(signupSchema), signup);

/**
 * @swagger
 * /api/v1/auth/signin:
 *   post:
 *     summary: Authenticate a user and return a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post("/signin", strictAuthLimiter, validate(signinSchema), signin);

/**
 * @swagger
 * /api/v1/auth/request-password-reset:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent
 *       404:
 *         description: User not found
 */
router.post("/request-password-reset", moderateAuthLimiter, validate(requestPasswordResetSchema), requestPasswordReset);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or password
 */
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

/**
 * @swagger
 * /api/v1/auth/request-email-verification:
 *   post:
 *     summary: Send email verification link
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Verification email sent
 */
router.post("/request-email-verification", gentleAuthLimiter, validate(requestEmailVerificationSchema), requestEmailVerification);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verify a user's email via token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified
 */
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

/**
 * @swagger
 * /api/v1/auth/resend-verification-email:
 *   post:
 *     summary: Resend email verification link
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Verification email resent
 */
router.post("/resend-verification-email", validate(resendEmailVerificationSchema), resendEmailVerification);

/**
 * @swagger
 * /api/v1/auth/verify-password-reset-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid OTP
 */
router.post("/verify-password-reset-otp", gentleAuthLimiter, validate(verifyPasswordResetOtpSchema), verifyPasswordResetOtp);

// Google OAuth routes

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Sign in or sign up using Google ID token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google authentication successful
 *       400:
 *         description: Invalid Google token
 */
router.post("/google", validate(googleAuthSchema), googleAuth);

/**
 * @swagger
 * /api/v1/auth/google/url:
 *   get:
 *     summary: Retrieve Google OAuth authorization URL
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Authorization URL generated
 */
router.get("/google/url", getGoogleAuthUrlController);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback endpoint
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Authorization code from Google
 *     responses:
 *       302:
 *         description: Redirect to frontend with token
 */
router.get("/google/callback", googleCallback);

// Protected routes

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Retrieve authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, getProfile);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               phonenumber:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 */
router.put("/profile", authenticate, upload.single("profilePic"), validate(updateProfileSchema), updateProfile);

/**
 * @swagger
 * /api/v1/auth/onboarding:
 *   post:
 *     summary: Complete onboarding for authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, host]
 *                 description: User role (user or host)
 *               bio:
 *                 type: string
 *                 description: Host bio (required if role is host)
 *               company:
 *                 type: string
 *                 description: Company name (optional for hosts)
 *               phoneNumber:
 *                 type: string
 *                 description: Contact number (required if role is host)
 *               profilePic:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture (optional)
 *               location:
 *                 type: string
 *                 description: Physical location/address (required if role is host)
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 *       400:
 *         description: Validation error or missing required fields
 *       401:
 *         description: Unauthorized - authentication required
 */
router.post(
  "/onboarding",
  authenticate,
  upload.single('profilePic'),
  validate(completeOnboardingSchema),
  completeOnboarding
);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     summary: Change password for authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Validation error
 */
router.put("/change-password", authenticate, validate(changePasswordSchema), changePassword);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", authenticate, logout);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh an authentication token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post("/refresh-token", authenticate, refreshToken);

/**
 * @swagger
 * /api/v1/auth/delete-account:
 *   delete:
 *     summary: Delete authenticated user's account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete("/account", authenticate, validate(deleteAccountSchema), deleteAccount);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

export default router;
