import RefreshToken from "../models/RefreshToken.model.js";
import AppError from "../utils/AppError.js";
import { TOKENS } from "../config/constants.js";
import logger from "../config/logger.js";

class RefreshTokenRepository {
  /**
   * Create a new refresh token
   * @param {Object} tokenData - Token data
   * @param {string} tokenData.token - Token string
   * @param {string} tokenData.userId - User ID
   * @param {Date} tokenData.expiresAt - Expiration date
   * @param {string} tokenData.userAgent - User agent
   * @param {string} tokenData.ipAddress - IP address
   * @returns {Promise<Object>} Created token document
   */
  async create(tokenData) {
    try {
      await this.enforceTokenLimit(tokenData.userId);

      const refreshToken = new RefreshToken({
        token: tokenData.token,
        userId: tokenData.userId,
        expiresAt: tokenData.expiresAt,
        userAgent: tokenData.userAgent || "Unknown",
        ipAddress: tokenData.ipAddress || "Unknown",
        createdAt: new Date(),
      });

      return await refreshToken.save();
    } catch (error) {
      logger.error("RefreshTokenRepository.create failed", {
        error: error.message,
      });
      throw new AppError("Failed to create refresh token", 500, error);
    }
  }

  /**
   * Find a valid (non-expired) refresh token
   * @param {string} token - Token string
   * @returns {Promise<Object|null>} Token document or null
   */
  async findByToken(token) {
    try {
      return await RefreshToken.findOne({
        token,
        expiresAt: { $gt: new Date() },
      }).populate("userId", "-password");
    } catch (error) {
      logger.error("RefreshTokenRepository.findByToken failed", {
        error: error.message,
      });
      throw new AppError("Failed to find refresh token", 500, error);
    }
  }

  /**
   * Update an existing refresh token (token rotation)
   * @param {string} oldToken - Old token to replace
   * @param {Object} newTokenData - New token data
   * @returns {Promise<Object>} New token document
   */
  async updateToken(oldToken, newTokenData) {
    try {
      await this.deleteByToken(oldToken);

      return await this.create(newTokenData);
    } catch (error) {
      logger.error("RefreshTokenRepository.updateToken failed", {
        error: error.message,
      });
      throw new AppError("Failed to update refresh token", 500, error);
    }
  }

  /**
   * Delete a specific refresh token
   * @param {string} token - Token to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteByToken(token) {
    try {
      const result = await RefreshToken.deleteOne({ token });

      if (result.deletedCount === 0) {
        logger.warn("RefreshTokenRepository.deleteByToken - Token not found", {
          token: token.substring(0, 20),
        });
      }

      return result;
    } catch (error) {
      logger.error("RefreshTokenRepository.deleteByToken failed", {
        error: error.message,
      });
      throw new AppError("Failed to delete refresh token", 500, error);
    }
  }

  /**
   * Delete all refresh tokens for a user (logout all sessions)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAllForUser(userId) {
    try {
      const result = await RefreshToken.deleteMany({ userId });
      logger.info("RefreshTokenRepository.deleteAllForUser", {
        userId,
        tokensDeleted: result.deletedCount,
      });
      return result;
    } catch (error) {
      logger.error("RefreshTokenRepository.deleteAllForUser failed", {
        error: error.message,
      });
      throw new AppError("Failed to delete user refresh tokens", 500, error);
    }
  }

  /**
   * Get all active tokens for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of active token documents
   */
  async getActiveTokensForUser(userId) {
    try {
      return await RefreshToken.find({
        userId,
        expiresAt: { $gt: new Date() },
      })
        .select("token userAgent ipAddress createdAt expiresAt")
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      logger.error("RefreshTokenRepository.getActiveTokensForUser failed", {
        error: error.message,
      });
      throw new AppError("Failed to get user sessions", 500, error);
    }
  }

  /**
   * Enforce maximum number of refresh tokens per user
   * Deletes oldest tokens if limit exceeded
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async enforceTokenLimit(userId) {
    try {
      const activeTokens = await RefreshToken.find({
        userId,
        expiresAt: { $gt: new Date() },
      })
        .sort({ createdAt: 1 })
        .select("_id")
        .lean();

      const excessCount =
        activeTokens.length - TOKENS.MAX_REFRESH_TOKENS_PER_USER + 1;

      if (excessCount > 0) {
        const tokensToDelete = activeTokens
          .slice(0, excessCount)
          .map((t) => t._id);
        await RefreshToken.deleteMany({ _id: { $in: tokensToDelete } });

        logger.info("RefreshTokenRepository.enforceTokenLimit", {
          userId,
          deletedCount: tokensToDelete.length,
        });
      }
    } catch (error) {
      logger.error("RefreshTokenRepository.enforceTokenLimit failed", {
        error: error.message,
      });
      // Don't throw - this is a cleanup operation that shouldn't block token creation
    }
  }

  /**
   * Manually clean expired tokens (TTL should handle this automatically)
   * Useful for debugging or manual cleanup
   * @returns {Promise<Object>} Deletion result
   */
  async cleanExpiredTokens() {
    try {
      const result = await RefreshToken.deleteMany({
        expiresAt: { $lte: new Date() },
      });

      logger.info("RefreshTokenRepository.cleanExpiredTokens", {
        tokensDeleted: result.deletedCount,
      });

      return result;
    } catch (error) {
      logger.error("RefreshTokenRepository.cleanExpiredTokens failed", {
        error: error.message,
      });
      throw new AppError("Failed to clean expired tokens", 500, error);
    }
  }

  /**
   * Get statistics about refresh tokens
   * @returns {Promise<Object>} Token statistics
   */
  async getStatistics() {
    try {
      const total = await RefreshToken.countDocuments();
      const active = await RefreshToken.countDocuments({
        expiresAt: { $gt: new Date() },
      });
      const expired = total - active;

      return { total, active, expired };
    } catch (error) {
      logger.error("RefreshTokenRepository.getStatistics failed", {
        error: error.message,
      });
      throw new AppError("Failed to get token statistics", 500, error);
    }
  }
}

export default new RefreshTokenRepository();
