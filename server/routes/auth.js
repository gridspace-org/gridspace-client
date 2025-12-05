import express from "express";
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
  deleteAccount,
} from "../controllers/auth/index.js";
import { authenticate } from "../middleware/auth.js";
import upload from "../config/multer.js";
import validate from "../middleware/validate.js";
import { authRateLimit, passwordResetLimit } from "../middleware/rateLimits.js";
import {
  signupSchema,
  signinSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  requestEmailVerificationSchema,
  resendEmailVerificationSchema,
  verifyPasswordResetOtpSchema,
  googleAuthSchema,
  updateProfileSchema,
  completeOnboardingSchema,
  deleteAccountSchema,
} from "../validators/auth.validator.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and profile management endpoints
 */

const router = express.Router();

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
 *         description: User created successfully. Email verification required before login.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Registration successful. Please verify your email to continue."
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     emailVerificationRequired:
 *                       type: boolean
 *                       example: true
 *                     nextSteps:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post(
  "/signup",
  authRateLimit,
  upload.single("profilePic"),
  validate(signupSchema),
  signup
);

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
 *         description: Login successful. Tokens are set in HTTP-only cookies and returned in response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Authentication successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           description: JWT access token (15 minutes)
 *                         refreshToken:
 *                           type: string
 *                           description: Refresh token (7 days)
 *                         expiresIn:
 *                           type: number
 *                           example: 900
 *                         tokenType:
 *                           type: string
 *                           example: "Bearer"
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account suspended or inactive
 */
router.post("/signin", authRateLimit, validate(signinSchema), signin);

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
router.post(
  "/request-password-reset",
  passwordResetLimit,
  validate(requestPasswordResetSchema),
  requestPasswordReset
);

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
router.post(
  "/request-email-verification",
  authRateLimit,
  validate(requestEmailVerificationSchema),
  requestEmailVerification
);

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
router.post(
  "/resend-verification-email",
  validate(resendEmailVerificationSchema),
  resendEmailVerification
);

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
router.post(
  "/verify-password-reset-otp",
  passwordResetLimit,
  validate(verifyPasswordResetOtpSchema),
  verifyPasswordResetOtp
);

// Google OAuth routes

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Sign in or sign up using Google ID token (Mobile/Web SDK)
 *     description: Authenticate with Google using ID token from Google Sign-In SDK. Automatically creates account if user doesn't exist.
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
 *                 description: Google ID token from Google Sign-In SDK
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "google authentication successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                         expiresIn:
 *                           type: number
 *                         tokenType:
 *                           type: string
 *                           example: "Bearer"
 *                     provider:
 *                       type: string
 *                       example: "google"
 *       400:
 *         description: Invalid Google token or missing idToken
 *       401:
 *         description: Token verification failed
 */
router.post("/google", validate(googleAuthSchema), googleAuth);

/**
 * @swagger
 * /api/v1/auth/google/url:
 *   get:
 *     summary: Get Google OAuth authorization URL (Server-side flow)
 *     description: Returns the Google OAuth URL for server-side authentication flow. User should be redirected to this URL.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Google OAuth URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Google OAuth URL generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     googleAuthUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://accounts.google.com/oauth/authorize?..."
 *                     clientId:
 *                       type: string
 *       500:
 *         description: Google OAuth not configured
 */
router.get("/google/url", getGoogleAuthUrlController);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback endpoint (Server-side flow)
 *     description: Handles Google OAuth redirect. Exchanges authorization code for tokens and redirects to frontend with access/refresh tokens.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Authorization code from Google
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: OAuth error from Google (if any)
 *     responses:
 *       302:
 *         description: Redirects to frontend
 *         headers:
 *           Location:
 *             description: Redirect URL with tokens or error
 *             schema:
 *               type: string
 *               example: "http://localhost:3000/auth/google/success?accessToken=...&refreshToken=..."
 *       400:
 *         description: Missing authorization code
 *       401:
 *         description: Failed to authenticate with Google
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
router.put(
  "/profile",
  authenticate,
  upload.single("profilePic"),
  validate(updateProfileSchema),
  updateProfile
);

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
 *               - fullname
 *               - phonenumber
 *               - bio
 *               - location
 *             properties:
 *               fullname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: User's full name (required, 2-100 characters)
 *               role:
 *                 type: string
 *                 enum: [user, host]
 *                 description: User role (user or host)
 *               phonenumber:
 *                 type: string
 *                 description: Contact number (required for hosts)
 *               bio:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: User bio (required if role is host, 10-500 characters)
 *               location:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: User's location (required for hosts, 5-200 characters)
 *               company:
 *                 type: string
 *                 description: Company name (optional for hosts)
 *               profilePic:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture (optional)
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Onboarding completed successfully. Welcome to the platform!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     profile:
 *                       type: object
 *                       properties:
 *                         lastUpdated:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Validation error or missing required fields
 *       401:
 *         description: Unauthorized - authentication required
 */
router.post(
  "/onboarding",
  authenticate,
  upload.single("profilePic"),
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
router.put(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

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
 *     summary: Refresh access token using refresh token
 *     description: Get a new access token and refresh token. Requires refresh token in HTTP-only cookie. New tokens are automatically set in cookies.
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       description: Refresh token should be in HTTP-only cookie, not request body
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token (15 minutes)
 *                     refreshToken:
 *                       type: string
 *                       description: New refresh token (7 days)
 *                     expiresIn:
 *                       type: number
 *                       example: 900
 *                     tokenType:
 *                       type: string
 *                       example: "Bearer"
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh-token", authenticate, refreshToken);

/**
 * @swagger
 * /api/v1/auth/delete-account:
 *   post:
 *     summary: Delete user account (soft delete)
 *     description: Permanently deactivate user account. Requires password confirmation for security. Account is soft-deleted (isActive=false) to preserve data integrity.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current password for confirmation
 *                 example: "YourPassword123!"
 *     responses:
 *       200:
 *         description: Account successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Account successfully deleted. Your data has been deactivated."
 *       400:
 *         description: Password is required
 *       401:
 *         description: Invalid password or unauthorized
 *       404:
 *         description: User not found
 */
router.post(
  "/delete-account",
  authenticate,
  validate(deleteAccountSchema),
  deleteAccount
);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

export default router;
