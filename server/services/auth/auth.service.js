import authRepository from "../../repositories/auth.repository.js";
import refreshTokenRepository from "../../repositories/refreshToken.repository.js";
import {
  generateToken,
  generateRefreshToken,
  verifyToken,
  setTokenCookies,
  clearTokenCookies,
} from "../../controllers/auth/auth.utils.js";
import AppError from "../../utils/AppError.js";
import logger from "../../config/logger.js";
import {
  formatAuthResponse,
  formatTokenResponse,
  formatProfileResponse,
  formatPasswordResetResponse,
  formatEmailVerificationResponse,
  formatOAuthResponse,
  formatRegistrationResponse,
  formatLogoutResponse,
  formatAuthErrorResponse,
} from "../../utils/dto/auth.dto.js";
import otpService from "../otpService.js";
import emailService from "../emailService.js";
import walletService from "../wallet/wallet.service.js";
import { TOKENS } from "../../config/constants.js";

/**
 * Authentication Service
 * Handles all business logic for authentication
 */
class AuthService {
  /**
   * User registration
   * @param {Object} userData - User registration data
   * @param {Object} requestInfo - Request information
   * @returns {Promise<Object>} Registration result
   */
  async register(userData, requestInfo) {
    try {
      const {
        email,
        password,
        fullname,
        phonenumber,
        role = "user",
      } = userData;

      // Check if user already exists
      const userExists = await authRepository.userExistsByEmail(email);
      if (userExists) {
        throw new AppError("User with this email already exists", 409);
      }

      // Create user
      const user = await authRepository.createUser({
        email: email.toLowerCase(),
        password,
        fullname,
        phonenumber,
        role,
        isActive: true,
        emailVerified: false,
        onboardingCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create wallet for user
      try {
        const wallet = await walletService.createWallet(user._id);
        user.walletId = wallet._id;
        await user.save();
      } catch (error) {
        logger.error("Failed to create wallet during registration", {
          error: error.message,
          userId: user._id,
        });
        // Don't fail registration if wallet creation fails
      }

      // Send welcome email if verification is not required
      try {
        await emailService.sendWelcomeEmail(user.email, user.fullname);
      } catch (error) {
        // Don't fail registration if email fails
        logger.warn("Failed to send welcome email", {
          error: error.message,
          userId: user._id,
        });
      }

      // Log registration
      logger.info("User registered successfully", {
        userId: user._id,
        email: user.email,
        role: user.role,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
      });

      return formatRegistrationResponse(user, true);
    } catch (error) {
      logger.error("AuthService.register failed", {
        error: error.message,
        stack: error.stack,
        email: userData.email,
      });
      throw error;
    }
  }

  /**
   * User login
   * @param {Object} loginData - Login credentials
   * @param {Object} requestInfo - Request information
   * @returns {Promise<Object>} Login result
   */
  async login(loginData, requestInfo) {
    try {
      const { email, password } = loginData;
      const { ipAddress, userAgent } = requestInfo;

      // Find user with password
      const user = await authRepository.findUserByEmail(email, true);
      if (!user) {
        throw new AppError("Incorrect email or password", 401);
      }

      // Verify password
      const isPasswordValid = await authRepository.verifyPassword(
        user,
        password
      );
      if (!isPasswordValid) {
        throw new AppError("Incorrect email or password", 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError(
          "Account is suspended. Please contact support.",
          403
        );
      }

      // Generate tokens
      const accessToken = generateToken(user._id, "access");
      const refreshToken = generateRefreshToken();

      // Add refresh token to database
      await authRepository.addRefreshToken(user._id, {
        token: refreshToken.token,
        expiresAt: refreshToken.expiresAt,
        userAgent,
        ipAddress,
      });

      // Update login statistics
      const updatedUser = await authRepository.updateLoginStats(
        user._id,
        userAgent,
        ipAddress
      );

      // Remove sensitive data
      updatedUser.password = undefined;
      updatedUser.refreshTokens = undefined;

      // Log successful login
      logger.info("User logged in successfully", {
        userId: user._id,
        email: user.email,
        ipAddress,
        userAgent,
      });

      return formatAuthResponse(updatedUser, {
        accessToken,
        refreshToken: refreshToken.token,
        expiresIn: TOKENS.ACCESS_EXPIRES_SECONDS,
      });
    } catch (error) {
      logger.error("AuthService.login failed", {
        error: error.message,
        stack: error.stack,
        email: loginData.email,
        ipAddress: requestInfo.ipAddress,
      });
      throw error;
    }
  }

  /**
   * User logout
   * @param {string} refreshToken - Refresh token from cookie
   * @param {Object} user - User object
   * @returns {Promise<Object>} Logout result
   */
  async logout(refreshToken, user) {
    try {
      // Remove refresh token from database
      if (refreshToken) {
        await authRepository.removeRefreshToken(refreshToken);
      }

      // If user provided, remove all tokens (logout from all devices)
      if (user && user._id) {
        await authRepository.removeAllRefreshTokens(user._id);
      }

      // Log logout
      logger.info("User logged out", {
        userId: user?._id,
        allDevices: !!user,
        timestamp: new Date().toISOString(),
      });

      return formatLogoutResponse(true);
    } catch (error) {
      logger.error("AuthService.logout failed", {
        error: error.message,
        stack: error.stack,
        userId: user?._id,
      });
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token from cookie
   * @returns {Promise<Object>} Token refresh result
   */
  async refreshToken(refreshToken) {
    try {
      // Find user with valid refresh token
      const user = await authRepository.findUserByRefreshToken(refreshToken);
      if (!user) {
        throw new AppError("Invalid or expired refresh token", 401);
      }

      // Generate new tokens
      const newAccessToken = generateToken(user._id, "access");
      const newRefreshToken = generateRefreshToken();

      // Rotate refresh token
      await authRepository.updateRefreshToken(user._id, refreshToken, {
        token: newRefreshToken.token,
        expiresAt: newRefreshToken.expiresAt,
      });

      // Log token refresh
      logger.info("Token refreshed successfully", {
        userId: user._id,
        timestamp: new Date().toISOString(),
      });

      return formatTokenResponse({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken.token,
        expiresIn: TOKENS.ACCESS_EXPIRES_SECONDS,
      });
    } catch (error) {
      logger.error("AuthService.refreshToken failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile(userId) {
    try {
      const user = await authRepository.findUserById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      return formatProfileResponse(user);
    } catch (error) {
      logger.error("AuthService.getProfile failed", {
        error: error.message,
        stack: error.stack,
        userId,
      });
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile update data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(userId, updateData) {
    try {
      // Remove fields that shouldn't be updated via this endpoint
      const { password, email, role, isActive, ...allowedUpdates } = updateData;

      // Validate allowed updates
      const validatedData = this.validateProfileUpdates(allowedUpdates);

      const updatedUser = await authRepository.updateUserById(
        userId,
        validatedData
      );
      if (!updatedUser) {
        throw new AppError("User not found", 404);
      }

      // Check if onboarding is complete
      if (
        !updatedUser.onboardingCompleted &&
        this.isOnboardingComplete(updatedUser)
      ) {
        await authRepository.updateUserById(userId, {
          onboardingCompleted: true,
        });
        updatedUser.onboardingCompleted = true;
      }

      logger.info("Profile updated successfully", {
        userId,
        updatedFields: Object.keys(validatedData),
        timestamp: new Date().toISOString(),
      });

      return formatProfileResponse(updatedUser);
    } catch (error) {
      logger.error("AuthService.updateProfile failed", {
        error: error.message,
        stack: error.stack,
        userId,
      });
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Password change result
   */
  async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;

      // Get user with password
      const user = await authRepository.findUserById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Get user with current password for verification
      const userWithPassword = await authRepository.findUserByEmail(
        user.email,
        true
      );

      // Verify current password
      const isCurrentPasswordValid = await authRepository.verifyPassword(
        userWithPassword,
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        throw new AppError("Current password is incorrect", 400);
      }

      // Update password
      await authRepository.updatePassword(userId, newPassword);

      // Log password change
      logger.info("Password changed successfully", {
        userId,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      logger.error("AuthService.changePassword failed", {
        error: error.message,
        stack: error.stack,
        userId,
      });
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Password reset request result
   */
  async requestPasswordReset(email) {
    try {
      const user = await authRepository.findUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        return formatPasswordResetResponse(false);
      }

      // Generate OTP
      const otp = await otpService.generateOTP();

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(
          user.email,
          user.fullname,
          otp
        );
      } catch (error) {
        logger.error("Failed to send password reset email", {
          error: error.message,
          userId: user._id,
          email: user.email,
        });
        throw new AppError(
          "Failed to send reset email. Please try again.",
          500
        );
      }

      // Store OTP (this would typically be in a separate OTP collection)
      // For now, we'll log it for demonstration
      logger.info("Password reset requested", {
        userId: user._id,
        email: user.email,
        otpGenerated: true,
      });

      return formatPasswordResetResponse(true);
    } catch (error) {
      logger.error("AuthService.requestPasswordReset failed", {
        error: error.message,
        stack: error.stack,
        email,
      });
      throw error;
    }
  }

  /**
   * Verify password reset OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} OTP verification result
   */
  async verifyPasswordResetOtp(email, otp) {
    try {
      // Verify OTP
      const isValidOtp = await otpService.verifyOTP(otp, email);
      if (!isValidOtp.valid) {
        throw new AppError("Invalid or expired OTP", 400);
      }

      // Generate reset token
      const resetToken = generateToken(email, "password_reset");
      const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Log OTP verification
      logger.info("Password reset OTP verified", {
        email,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: "OTP verified successfully",
        data: {
          resetToken,
          expiresIn: TOKENS.PASSWORD_RESET_EXPIRES_MINUTES * 60,
        },
      };
    } catch (error) {
      logger.error("AuthService.verifyPasswordResetOtp failed", {
        error: error.message,
        stack: error.stack,
        email,
      });
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Password reset result
   */
  async resetPassword(token, newPassword) {
    try {
      // Verify reset token
      const decoded = verifyToken(token, "password_reset");
      const email = decoded.email;

      // Find user
      const user = await authRepository.findUserByEmail(email);
      if (!user) {
        throw new AppError("Invalid or expired reset token", 400);
      }

      // Update password
      await authRepository.updatePassword(user._id, newPassword);

      // Log password reset
      logger.info("Password reset successfully", {
        userId: user._id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      logger.error("AuthService.resetPassword failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Request email verification
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Email verification request result
   */
  async requestEmailVerification(userId) {
    try {
      const user = await authRepository.findUserById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (user.emailVerified) {
        throw new AppError("Email is already verified", 400);
      }

      // Generate verification OTP
      const otp = await otpService.generateOTP();

      // Send verification email
      try {
        await emailService.sendEmailVerificationEmail(
          user.email,
          user.fullname,
          otp
        );
      } catch (error) {
        logger.error("Failed to send verification email", {
          error: error.message,
          userId: user._id,
          email: user.email,
        });
        throw new AppError(
          "Failed to send verification email. Please try again.",
          500
        );
      }

      logger.info("Email verification requested", {
        userId: user._id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: "Verification email sent. Please check your email.",
      };
    } catch (error) {
      logger.error("AuthService.requestEmailVerification failed", {
        error: error.message,
        stack: error.stack,
        userId,
      });
      throw error;
    }
  }

  /**
   * Verify email with OTP
   * @param {string} userId - User ID
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} Email verification result
   */
  async verifyEmail(userId, otp) {
    try {
      const user = await authRepository.findUserById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (user.emailVerified) {
        throw new AppError("Email is already verified", 400);
      }

      // Verify OTP
      const isValidOtp = await otpService.verifyOTP(otp, user.email);
      if (!isValidOtp.valid) {
        throw new AppError("Invalid or expired OTP", 400);
      }

      // Update email verification status
      await authRepository.updateEmailVerification(userId, true);

      logger.info("Email verified successfully", {
        userId,
        email: user.email,
        timestamp: new Date().toISOString(),
      });

      return formatEmailVerificationResponse(true);
    } catch (error) {
      logger.error("AuthService.verifyEmail failed", {
        error: error.message,
        stack: error.stack,
        userId,
      });
      throw error;
    }
  }

  /**
   * Google OAuth authentication
   * @param {Object} googleData - Google OAuth data
   * @param {Object} requestInfo - Request information
   * @returns {Promise<Object>} OAuth authentication result
   */
  async googleAuth(googleData, requestInfo) {
    try {
      const { email, fullname, googleId, picture } = googleData;

      // Find or create user
      let user = await authRepository.findUserByEmail(email);

      if (!user) {
        // Create new user
        user = await authRepository.createUser({
          email: email.toLowerCase(),
          fullname,
          profilePic: picture,
          googleId,
          isActive: true,
          emailVerified: true, // Google emails are verified
          onboardingCompleted: false,
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create wallet for new Google user
        try {
          const wallet = await walletService.createWallet(user._id);
          user.walletId = wallet._id;
          await user.save();
        } catch (error) {
          logger.error("Failed to create wallet for Google user", {
            error: error.message,
            userId: user._id,
          });
        }

        logger.info("New user created via Google OAuth", {
          userId: user._id,
          email: user.email,
          googleId,
        });
      } else {
        // Update existing user
        await authRepository.updateUserById(user._id, {
          googleId,
          profilePic: picture,
          emailVerified: true,
        });
      }

      // Generate tokens
      const accessToken = generateToken(user._id, "access");
      const refreshToken = generateRefreshToken();

      // Add refresh token
      await authRepository.addRefreshToken(user._id, {
        token: refreshToken.token,
        expiresAt: refreshToken.expiresAt,
        userAgent: requestInfo.userAgent,
        ipAddress: requestInfo.ipAddress,
      });

      logger.info("Google OAuth authentication successful", {
        userId: user._id,
        email: user.email,
        isNewUser: !user.googleId,
        ipAddress: requestInfo.ipAddress,
      });

      return formatOAuthResponse(
        user,
        {
          accessToken,
          refreshToken: refreshToken.token,
          expiresIn: TOKENS.ACCESS_EXPIRES_SECONDS,
        },
        "google"
      );
    } catch (error) {
      logger.error("AuthService.googleAuth failed", {
        error: error.message,
        stack: error.stack,
        email: googleData.email,
      });
      throw error;
    }
  }

  /**
   * Validate profile update data
   * @param {Object} updateData - Update data
   * @returns {Object} Validated data
   */
  validateProfileUpdates(updateData) {
    const allowedFields = [
      "fullname",
      "phonenumber",
      "profilePic",
      "bio",
      "location",
      "preferences",
    ];
    const validatedData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        validatedData[key] = updateData[key];
      }
    });

    return validatedData;
  }

  /**
   * Check if user onboarding is complete
   * @param {Object} user - User object
   * @returns {boolean} Whether onboarding is complete
   */
  isOnboardingComplete(user) {
    return !!(user.fullname && user.email && user.emailVerified);
  }

  /**
   * Delete user account (soft delete)
   * @param {string} userId - User ID
   * @param {string} password - Password confirmation
   * @returns {Promise<Object>} Deletion result
   */
  async deleteUser(userId, password) {
    try {
      // Get user
      const user = await authRepository.getUserById(userId);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError("Invalid password", 401);
      }

      // Soft delete: Set isActive to false instead of hard delete
      // This preserves data integrity and allows for potential recovery
      await authRepository.updateUserById(userId, {
        isActive: false,
        deactivatedAt: new Date(),
      });

      logger.info("User account deleted", { userId, email: user.email });

      return {
        success: true,
        message: "Account successfully deleted",
      };
    } catch (error) {
      logger.error("Delete user failed", {
        userId,
        error: error.message,
      });
      throw error;
    }
  }
}

export default new AuthService();
