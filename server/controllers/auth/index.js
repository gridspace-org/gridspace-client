/**
 * Auth Controllers
 *
 * This file serves as the entry point for all auth-related controllers.
 * It exports all controller functions using the new layered architecture pattern.
 *
 * Architecture: Controllers → Services → Repositories → Models
 * - Controllers: Thin orchestration layer, HTTP handling, validation
 * - Services: Business logic, workflow orchestration, external integrations
 * - Repositories: Database operations, data access abstraction
 * - Models: Mongoose schemas and instance methods
 */

// Import session controllers (login/logout/token management)
import {
  signin,
  logout,
  refreshToken,
  getCurrentUser
} from './session.controller.js';

// Import registration controller
import { signup } from './registration.controller.js';

// Import profile controllers (user profile management)
import {
  getProfile,
  updateProfile,
  changePassword,
  completeOnboarding,
  deleteAccount
} from './profile.controller.js';

// Import password controllers (password reset functionality)
import {
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword
} from './password.controller.js';

// Import verification controllers (email verification)
import {
  requestEmailVerification,
  verifyEmail,
  resendEmailVerification
} from './verification.controller.js';

// Import OAuth controllers (Google authentication)
import {
  googleAuth,
  getGoogleAuthUrlController,
  googleCallback
} from './oauth.controller.js';

// Re-export all controllers
export {
  signin,
  logout,
  refreshToken,
  getCurrentUser,
  signup,
  getProfile,
  updateProfile,
  changePassword,
  completeOnboarding,
  deleteAccount,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
  resendEmailVerification,
  googleAuth,
  getGoogleAuthUrlController,
  googleCallback
};

// Default export for easier imports
export default {
  signin,
  logout,
  refreshToken,
  getCurrentUser,
  signup,
  getProfile,
  updateProfile,
  changePassword,
  completeOnboarding,
  deleteAccount,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
  resendEmailVerification,
  googleAuth,
  getGoogleAuthUrlController,
  googleCallback
};
