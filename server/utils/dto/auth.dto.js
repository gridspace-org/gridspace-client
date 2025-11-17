import { format, parseISO } from 'date-fns';

/**
 * Authentication Data Transfer Objects
 * Standardizes auth responses for consistency
 */

/**
 * Format user data for authentication responses
 * @param {Object} user - User object from database
 * @returns {Object} Formatted user data
 */
export const formatAuthUserResponse = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
    phonenumber: user.phonenumber,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    onboardingCompleted: user.onboardingCompleted,
    profilePic: user.profilePic,
    
    // Account status
    accountStatus: {
      isActive: user.isActive,
      isEmailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      hasCompletedProfile: !!(user.fullname && user.email)
    },
    
    // Security information
    security: {
      lastLogin: user.lastLogin,
      loginCount: user.loginCount || 0,
      accountAge: calculateAccountAge(user.createdAt),
      twoFactorEnabled: user.twoFactorEnabled || false
    },
    
    // Preferences
    preferences: {
      notifications: user.notifications || {},
      privacy: user.privacy || {}
    },
    
    // Metadata
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Format authentication response for login/signup
 * @param {Object} user - User object
 * @param {Object} tokens - Token information
 * @param {string} message - Success message
 * @returns {Object} Standardized auth response
 */
export const formatAuthResponse = (user, tokens, message = 'Authentication successful') => {
  return {
    success: true,
    message,
    data: {
      user: formatAuthUserResponse(user),
      tokens: tokens ? {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn || 15 * 60, // 15 minutes default
        tokenType: 'Bearer'
      } : null
    },
    metadata: {
      authenticatedAt: new Date().toISOString(),
      userAgent: 'provided',
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Format token refresh response
 * @param {Object} tokens - New token information
 * @param {string} message - Success message
 * @returns {Object} Standardized token response
 */
export const formatTokenResponse = (tokens, message = 'Token refreshed successfully') => {
  return {
    success: true,
    message,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn || 15 * 60,
      tokenType: 'Bearer'
    },
    metadata: {
      refreshedAt: new Date().toISOString()
    }
  };
};

/**
 * Format profile response
 * @param {Object} user - User object
 * @param {Object} profileData - Additional profile data
 * @returns {Object} Standardized profile response
 */
export const formatProfileResponse = (user, profileData = {}) => {
  return {
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: formatAuthUserResponse(user),
      profile: {
        ...profileData,
        lastUpdated: new Date().toISOString()
      }
    }
  };
};

/**
 * Format password reset response
 * @param {boolean} emailSent - Whether email was sent
 * @param {string} message - Success message
 * @returns {Object} Standardized password reset response
 */
export const formatPasswordResetResponse = (emailSent, message = 'Password reset instructions sent') => {
  return {
    success: true,
    message,
    data: {
      emailSent,
      instructions: emailSent ? 
        'Please check your email for password reset instructions' : 
        'Unable to send reset email. Please try again.'
    },
    metadata: {
      requestedAt: new Date().toISOString()
    }
  };
};

/**
 * Format email verification response
 * @param {boolean} verified - Whether email was verified
 * @param {string} message - Success message
 * @returns {Object} Standardized verification response
 */
export const formatEmailVerificationResponse = (verified, message = 'Email verification processed') => {
  return {
    success: true,
    message,
    data: {
      verified,
      emailStatus: verified ? 'verified' : 'pending',
      nextSteps: verified ? 
        'Your email has been verified. You can now access all platform features.' :
        'Please check your email and click the verification link.'
    },
    metadata: {
      verifiedAt: verified ? new Date().toISOString() : null
    }
  };
};

/**
 * Format OAuth response
 * @param {Object} user - User object
 * @param {Object} tokens - Token information
 * @param {string} provider - OAuth provider
 * @returns {Object} Standardized OAuth response
 */
export const formatOAuthResponse = (user, tokens, provider = 'google') => {
  return {
    success: true,
    message: `${provider} authentication successful`,
    data: {
      user: formatAuthUserResponse(user),
      tokens: tokens ? {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        tokenType: 'Bearer'
      } : null,
      provider,
      connectedAt: new Date().toISOString()
    }
  };
};

/**
 * Format error response for auth operations
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Array} details - Additional error details
 * @returns {Object} Standardized error response
 */
export const formatAuthErrorResponse = (message, code = 'AUTH_ERROR', details = []) => {
  return {
    success: false,
    error: {
      code,
      message,
      details: details.length > 0 ? details : undefined,
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Utility function to calculate account age in days
 * @param {Date|string} createdAt - Creation date
 * @returns {number} Age in days
 */
const calculateAccountAge = (createdAt) => {
  if (!createdAt) return 0;
  
  const created = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt;
  const now = new Date();
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format session information
 * @param {Object} session - Session/token information
 * @returns {Object} Formatted session data
 */
export const formatSessionResponse = (session) => {
  if (!session) return null;

  return {
    id: session._id,
    token: session.token,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    lastUsedAt: session.lastUsedAt,
    isActive: new Date() < new Date(session.expiresAt),
    timeUntilExpiry: getTimeUntilExpiry(session.expiresAt)
  };
};

/**
 * Format logout response
 * @param {boolean} success - Whether logout was successful
 * @param {string} message - Success message
 * @returns {Object} Standardized logout response
 */
export const formatLogoutResponse = (success = true, message = 'Logged out successfully') => {
  return {
    success,
    message,
    data: {
      loggedOutAt: new Date().toISOString(),
      allSessionsCleared: success
    }
  };
};

/**
 * Utility function to get time until token expiry
 * @param {Date|string} expiryDate - Expiry date
 * @returns {Object} Time until expiry information
 */
const getTimeUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  
  const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
  const now = new Date();
  const diffTime = expiry - now;
  
  if (diffTime <= 0) {
    return {
      status: 'expired',
      message: 'Token has expired',
      timeRemaining: 0
    };
  }
  
  const hours = Math.floor(diffTime / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    status: 'active',
    hoursUntilExpiry: hours,
    minutesUntilExpiry: minutes,
    totalMinutesUntilExpiry: Math.floor(diffTime / (1000 * 60)),
    formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  };
};

/**
 * Format registration response
 * @param {Object} user - User object
 * @param {boolean} emailVerificationRequired - Whether email verification is needed
 * @returns {Object} Standardized registration response
 */
export const formatRegistrationResponse = (user, emailVerificationRequired = true) => {
  const message = emailVerificationRequired ? 
    'Registration successful. Please verify your email to continue.' :
    'Registration successful. Welcome to the platform!';
  
  return {
    success: true,
    message,
    data: {
      user: formatAuthUserResponse(user),
      emailVerificationRequired,
      nextSteps: emailVerificationRequired ? [
        'Check your email for verification link',
        'Click the verification link to activate your account',
        'Complete your profile setup'
      ] : [
        'Complete your profile setup',
        'Explore available features'
      ]
    },
    metadata: {
      registeredAt: new Date().toISOString()
    }
  };
};