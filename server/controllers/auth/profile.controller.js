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
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { role, location } = req.body;
  let purposes = req.body.purposes;
  
  // Parse purposes if it's a JSON string (from FormData)
  if (typeof purposes === 'string') {
    try {
      purposes = JSON.parse(purposes);
    } catch (error) {
      throw new AppError('Invalid purposes format', 400);
    }
  }
  
  // Basic validation
  if (!role) {
    throw new AppError('Role is required for onboarding', 400);
  }

  const validRoles = ['user', 'host', 'admin'];
  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role. Must be one of: user, host, admin', 400);
  }

  // Prepare update data
  const updateData = {
    role: role.trim(),
    onboardingCompleted: true,
    ...(location && { location: location.trim() }),
    ...(purposes && Array.isArray(purposes) && purposes.length > 0 && { purposes })
  };

  // Handle profile picture upload if provided
  if (req.file) {
    try {
      updateData.profilePic = await uploadProfileImage(req.file);
    } catch (error) {
      throw new AppError('Failed to upload profile picture', 500);
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw new AppError('User not found', 404);
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
