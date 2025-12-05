import User from "../models/User.model.js";
import AppError from "../utils/AppError.js";
import refreshTokenRepository from "./refreshToken.repository.js";

class AuthRepository {
  /**
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Whether to include password in result
   * @returns {Promise<Object|null>} User object or null
   */
  async findUserByEmail(email, includePassword = false) {
    try {
      const selectFields = includePassword ? "+password" : "-password";
      return await User.findOne({ email: email.toLowerCase() }).select(
        selectFields
      );
    } catch (error) {
      throw new AppError("Failed to find user by email", 500, error);
    }
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findUserById(userId) {
    try {
      return await User.findById(userId).select("-password");
    } catch (error) {
      throw new AppError("Failed to find user by ID", 500, error);
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  async createUser(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("User with this email already exists", 409);
      }
      throw new AppError("Failed to create user", 500, error);
    }
  }

  /**
   * Update user by ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated user object
   */
  async updateUserById(userId, updateData) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select("-password");
    } catch (error) {
      throw new AppError("Failed to update user", 500, error);
    }
  }

  /**
   * Find user with refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object|null>} User object or null
   */
  async findUserByRefreshToken(refreshToken) {
    try {
      const tokenDoc = await refreshTokenRepository.findByToken(refreshToken);
      if (!tokenDoc) return null;
      return await User.findById(tokenDoc.userId).select("+password");
    } catch (error) {
      throw new AppError("Failed to find user by refresh token", 500, error);
    }
  }

  /**
   * Add refresh token to user
   * @param {string} userId - User ID
   * @param {Object} tokenData - Token data
   * @returns {Promise<Object>} Updated user object
   */
  async addRefreshToken(userId, tokenData) {
    try {
      return await refreshTokenRepository.create({
        ...tokenData,
        userId,
      });
    } catch (error) {
      throw new AppError("Failed to add refresh token", 500, error);
    }
  }

  /**
   * Update refresh token (rotation)
   * @param {string} userId - User ID
   * @param {string} oldToken - Old refresh token
   * @param {Object} newTokenData - New token data
   * @returns {Promise<Object>} Updated user object
   */
  async updateRefreshToken(userId, oldToken, newTokenData) {
    try {
      return await refreshTokenRepository.updateToken(oldToken, {
        ...newTokenData,
        userId,
      });
    } catch (error) {
      throw new AppError("Failed to update refresh token", 500, error);
    }
  }

  /**
   * Remove refresh token from user
   * @param {string} refreshToken - Refresh token to remove
   * @returns {Promise<Object>} Updated user object
   */
  async removeRefreshToken(refreshToken) {
    try {
      return await refreshTokenRepository.deleteByToken(refreshToken);
    } catch (error) {
      throw new AppError("Failed to remove refresh token", 500, error);
    }
  }

  /**
   * Remove all refresh tokens from user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user object
   */
  async removeAllRefreshTokens(userId) {
    try {
      return await refreshTokenRepository.deleteAllForUser(userId);
    } catch (error) {
      throw new AppError("Failed to remove all refresh tokens", 500, error);
    }
  }

  /**
   * Update user login statistics
   * @param {string} userId - User ID
   * @param {string} userAgent - User agent
   * @param {string} ipAddress - IP address
   * @returns {Promise<Object>} Updated user object
   */
  async updateLoginStats(userId, userAgent, ipAddress) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            lastLogin: new Date(),
            lastLoginIp: ipAddress,
            lastLoginUserAgent: userAgent,
          },
          $inc: { loginCount: 1 },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      ).select("-password");
    } catch (error) {
      throw new AppError("Failed to update login stats", 500, error);
    }
  }

  /**
   * Check if user exists by email
   * @param {string} email - User email
   * @returns {Promise<boolean>} Whether user exists
   */
  async userExistsByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "_id"
      );
      return !!user;
    } catch (error) {
      throw new AppError("Failed to check user existence", 500, error);
    }
  }

  /**
   * Delete user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user object
   */
  async deleteUser(userId) {
    try {
      return await User.findByIdAndDelete(userId);
    } catch (error) {
      throw new AppError("Failed to delete user", 500, error);
    }
  }

  /**
   * Get user's active sessions
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of active sessions
   */
  async getUserSessions(userId) {
    try {
      return await refreshTokenRepository.getActiveTokensForUser(userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to get user sessions", 500, error);
    }
  }

  /**
   * Clean expired refresh tokens
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user object
   */
  async cleanExpiredTokens(userId) {
    try {
      return await refreshTokenRepository.cleanExpiredTokens();
    } catch (error) {
      throw new AppError("Failed to clean expired tokens", 500, error);
    }
  }

  /**
   * Find users by criteria (for admin operations)
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of users
   */
  async findUsersByCriteria(criteria = {}, options = {}) {
    try {
      const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      return await User.find(criteria)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw new AppError("Failed to find users", 500, error);
    }
  }

  /**
   * Count users by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Count of users
   */
  async countUsersByCriteria(criteria = {}) {
    try {
      return await User.countDocuments(criteria);
    } catch (error) {
      throw new AppError("Failed to count users", 500, error);
    }
  }

  /**
   * Verify user password
   * @param {Object} user - User object with password
   * @param {string} password - Plain text password
   * @returns {Promise<boolean>} Whether password is correct
   */
  async verifyPassword(user, password) {
    try {
      return await user.comparePassword(password);
    } catch (error) {
      throw new AppError("Failed to verify password", 500, error);
    }
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Updated user object
   */
  async updatePassword(userId, newPassword) {
    try {
      const user = await User.findById(userId).select(
        "email fullname role profilePicture hasCompletedOnboarding createdAt"
      );
      if (!user) {
        throw new AppError("User not found", 404);
      }

      user.password = newPassword;
      return await user.save();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to update password", 500, error);
    }
  }

  /**
   * Update user email verification status
   * @param {string} userId - User ID
   * @param {boolean} verified - Verification status
   * @returns {Promise<Object>} Updated user object
   */
  async updateEmailVerification(userId, verified) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        {
          emailVerified: verified,
          emailVerifiedAt: verified ? new Date() : null,
          updatedAt: new Date(),
        },
        { new: true }
      ).select("-password");
    } catch (error) {
      throw new AppError("Failed to update email verification", 500, error);
    }
  }
}

export default new AuthRepository();
