import authService from "../../services/auth/auth.service.js";
import authRepository from "../../repositories/auth.repository.js";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * @desc    Get user profile
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  try {
    // Use service for profile retrieval
    const result = await authService.getProfile(req.user._id);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Get profile controller failed", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    throw error;
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  try {
    // Use service for profile update
    const result = await authService.updateProfile(req.user._id, req.body);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Update profile controller failed", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      updatedFields: Object.keys(req.body || {}),
    });
    throw error;
  }
});

/**
 * @desc    Change user password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      throw new AppError(
        "Please provide current password and new password",
        400
      );
    }

    // Use service for password change
    const result = await authService.changePassword(req.user._id, {
      currentPassword,
      newPassword,
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error("Change password controller failed", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    throw error;
  }
});

/**
 * @desc    Complete user onboarding
 * @route   POST /api/v1/auth/complete-onboarding
 * @access  Private
 */
export const completeOnboarding = asyncHandler(async (req, res) => {
  try {
    const { fullname, phonenumber, bio, location, role } = req.body;

    // Validate input
    if (!fullname) {
      throw new AppError("Full name is required to complete onboarding", 400);
    }

    // Handle role update separately since updateProfile service filters it out
    if (role) {
      await authRepository.updateUserById(req.user._id, { role });
    }

    // Use service for profile update with onboarding completion (excluding role)
    const result = await authService.updateProfile(req.user._id, {
      fullname,
      phonenumber,
      bio,
      location,
    });

    // Update the user data in the response to include the new role
    if (result.data && result.data.user && role) {
      result.data.user.role = role;
    }

    res.status(200).json({
      ...result,
      message: "Onboarding completed successfully. Welcome to the platform!",
    });
  } catch (error) {
    logger.error("Complete onboarding controller failed", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    throw error;
  }
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/auth/account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  try {
    const { password } = req.body;

    // Validate input
    if (!password) {
      throw new AppError(
        "Password confirmation is required to delete account",
        400
      );
    }

    // Delete account via service
    const result = await authService.deleteUser(req.user._id, password);

    // Clear cookies and tokens
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    // Send response
    res.status(200).json({
      success: true,
      message: "Account successfully deleted. Your data has been deactivated.",
    });
  } catch (error) {
    logger.error("Delete account controller failed", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    throw error;
  }
});
