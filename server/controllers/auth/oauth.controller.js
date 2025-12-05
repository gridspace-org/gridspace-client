import authService from "../../services/auth/auth.service.js";
import { externalServices } from "../../libs/externalServices.js";
import { googleClient as oauth2Client } from "../../config/googleAuth.js";
import { setTokenCookies } from "./auth.utils.js";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * @desc    Google OAuth authentication using ID token
 * @route   POST /api/v1/auth/google
 * @access  Public
 */
export const googleAuth = asyncHandler(async (req, res) => {
  try {
    const { idToken } = req.body;

    // Validate input
    if (!idToken) {
      throw new AppError("Google ID token is required", 400);
    }

    // Verify Google ID token
    let googleData;
    try {
      googleData = await externalServices.google.verifyToken(
        idToken,
        oauth2Client
      );
    } catch (error) {
      logger.error("Google token verification failed", {
        error: error.message,
        ipAddress: req.ip,
      });
      if (error.code === "GOOGLE_OAUTH_UNAVAILABLE") {
        throw new AppError(
          "Authentication service temporarily unavailable. Please try again.",
          503
        );
      }
      throw new AppError("Invalid Google token. Please try again.", 401);
    }

    // Validate required Google data
    if (!googleData.email || !googleData.googleId) {
      throw new AppError("Invalid Google token data", 400);
    }

    const requestInfo = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent") || "unknown",
    };

    // Use service for OAuth authentication
    const result = await authService.googleAuth(googleData, requestInfo);

    // Set cookies if tokens provided
    if (result.data?.tokens) {
      setTokenCookies(
        res,
        result.data.tokens.accessToken,
        result.data.tokens.refreshToken
      );
    }

    res.status(200).json(result);
  } catch (error) {
    logger.error("Google OAuth controller failed", {
      error: error.message,
      stack: error.stack,
      ipAddress: req.ip,
    });
    throw error;
  }
});

/**
 * @desc    Get Google OAuth URL
 * @route   GET /api/v1/auth/google/url
 * @access  Public
 */
export const getGoogleAuthUrlController = asyncHandler(async (req, res) => {
  try {
    const { getGoogleAuthUrl } = await import("../../config/googleAuth.js");

    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      throw new AppError(
        "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI in your environment variables.",
        500
      );
    }

    // Generate Google OAuth URL
    const googleAuthUrl = getGoogleAuthUrl();

    res.status(200).json({
      success: true,
      message: "Google OAuth URL generated successfully",
      data: {
        googleAuthUrl,
        clientId: process.env.GOOGLE_CLIENT_ID,
      },
    });
  } catch (error) {
    logger.error("Get Google auth URL controller failed", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
});

/**
 * @desc    Google OAuth callback - handles redirect from Google
 * @route   GET /api/v1/auth/google/callback
 * @access  Public
 */
export const googleCallback = asyncHandler(async (req, res) => {
  try {
    const { code, error: oauthError } = req.query;

    // Check for OAuth errors from Google
    if (oauthError) {
      logger.error("Google OAuth error", { error: oauthError });
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(
        `${frontendUrl}/auth/google/error?message=${encodeURIComponent(
          "Google authentication failed"
        )}`
      );
    }

    // Validate authorization code
    if (!code) {
      throw new AppError("Authorization code is required", 400);
    }

    // Exchange authorization code for user info
    const { getTokensFromCode } = await import("../../config/googleAuth.js");
    let googleData;

    try {
      googleData = await getTokensFromCode(code);
    } catch (error) {
      logger.error("Failed to exchange Google code for tokens", {
        error: error.message,
        code: code.substring(0, 10) + "...",
      });
      throw new AppError("Failed to authenticate with Google", 401);
    }

    // Validate required Google data
    if (!googleData.email || !googleData.googleId) {
      throw new AppError("Invalid Google user data", 400);
    }

    const requestInfo = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent") || "unknown",
    };

    // Authenticate user with Google data
    const result = await authService.googleAuth(googleData, requestInfo);

    // Set cookies if tokens provided
    if (result.data?.tokens) {
      setTokenCookies(
        res,
        result.data.tokens.accessToken,
        result.data.tokens.refreshToken
      );
    }

    // Redirect to frontend with tokens in URL (for mobile/web compatibility)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const accessToken = result.data?.tokens?.accessToken;
    const refreshToken = result.data?.tokens?.refreshToken;

    if (accessToken && refreshToken) {
      // Redirect with tokens as query params (frontend should extract and store)
      res.redirect(
        `${frontendUrl}/auth/google/success?` +
          `accessToken=${encodeURIComponent(accessToken)}&` +
          `refreshToken=${encodeURIComponent(refreshToken)}`
      );
    } else {
      // Fallback if tokens not generated
      res.redirect(`${frontendUrl}/auth/google/success`);
    }
  } catch (error) {
    logger.error("Google OAuth callback failed", {
      error: error.message,
      stack: error.stack,
      code: req.query?.code ? req.query.code.substring(0, 10) + "..." : null,
    });

    // Redirect to frontend with error
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(
      `${frontendUrl}/auth/google/error?message=${encodeURIComponent(
        error.message
      )}`
    );
  }
});
