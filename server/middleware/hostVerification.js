import User from '../models/User.model.js';
import Space from '../models/Space.model.js';
import logger from '../config/logger.js';

/**
 * Verify user has host role and completed onboarding
 * O(1) role and status checks
 */
export const verifyHostStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // O(1) direct field access for role and onboarding status
    if (req.user.role !== 'host') {
      logger.warn('Host verification failed - user not a host', {
        userId,
        userRole: req.user.role
      });
      return res.status(403).json({
        success: false,
        message: "Access denied. Host role required for this action.",
      });
    }

    if (!req.user.onboardingCompleted) {
      logger.warn('Host verification failed - onboarding not completed', {
        userId,
        onboardingCompleted: req.user.onboardingCompleted
      });
      return res.status(403).json({
        success: false,
        message: "Please complete your host onboarding before performing this action.",
      });
    }

    logger.info('Host status verified successfully', {
      userId,
      role: req.user.role,
      onboardingCompleted: req.user.onboardingCompleted
    });

    next();
    
  } catch (error) {
    logger.error('Host status verification failed', {
      error: error.message,
      userId: req.user?._id
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during host verification.",
      error: error.message,
    });
  }
};

/**
 * Prevent spam by limiting spaces per host
 * O(1) count query with hostId index
 */
export const checkSpaceLimit = async (req, res, next) => {
  try {
    const hostId = req.user._id;
    const maxSpacesPerHost = 10; // Configurable limit

    // O(1) count query using hostId index
    const spaceCount = await Space.countDocuments({ 
      hostId, 
      isActive: true 
    });

    if (spaceCount >= maxSpacesPerHost) {
      logger.warn('Host space limit exceeded', {
        hostId,
        currentSpaces: spaceCount,
        maxSpaces: maxSpacesPerHost
      });
      return res.status(400).json({
        success: false,
        message: `You have reached the maximum limit of ${maxSpacesPerHost} active spaces. Please deactivate some spaces before creating new ones.`,
      });
    }

    logger.info('Host space limit check passed', {
      hostId,
      currentSpaces: spaceCount,
      maxSpaces: maxSpacesPerHost
    });

    next();
    
  } catch (error) {
    logger.error('Space limit check failed', {
      error: error.message,
      hostId: req.user?._id
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during space limit check.",
      error: error.message,
    });
  }
};

/**
 * Verify host can manage the specific space (ownership + active status)
 * O(1) indexed lookup with hostId and spaceId
 */
export const verifyHostSpaceAccess = async (req, res, next) => {
  try {
    const { id: spaceId } = req.params;
    const hostId = req.user._id;

    if (!spaceId) {
      logger.warn('Host space access check called without space ID', { hostId });
      return res.status(400).json({
        success: false,
        message: "Space ID is required.",
      });
    }

    // O(1) indexed query to verify host owns the space
    const space = await Space.findOne({
      _id: spaceId,
      hostId: hostId,
      isActive: true
    });

    if (!space) {
      logger.warn('Host space access verification failed', {
        hostId,
        spaceId,
        userRole: req.user.role
      });
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't own this space or it's not active.",
      });
    }

    logger.info('Host space access verified successfully', {
      hostId,
      spaceId,
      spaceTitle: space.title
    });

    req.space = space;
    next();
    
  } catch (error) {
    logger.error('Host space access check failed', {
      error: error.message,
      spaceId: req.params?.id,
      hostId: req.user?._id
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during host space access verification.",
      error: error.message,
    });
  }
};

/**
 * Check if host can receive payments (account setup complete)
 * O(1) user field checks
 */
export const checkHostPaymentEligibility = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // In future, add payment-specific checks like:
    // - Bank account verified
    // - Tax information provided
    // - Payment method setup complete
    
    const paymentSetupComplete = true; // Placeholder for future payment checks

    if (!paymentSetupComplete) {
      logger.warn('Host payment eligibility check failed', {
        userId,
        role: req.user.role
      });
      return res.status(403).json({
        success: false,
        message: "Please complete your payment setup to receive bookings and payments.",
      });
    }

    logger.info('Host payment eligibility verified', {
      userId,
      paymentSetupComplete
    });

    next();
    
  } catch (error) {
    logger.error('Host payment eligibility check failed', {
      error: error.message,
      userId: req.user?._id
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during payment eligibility check.",
      error: error.message,
    });
  }
};

/**
 * Combined middleware for host space creation
 */
export const validateHostSpaceCreation = [
  verifyHostStatus,
  checkSpaceLimit,
  checkHostPaymentEligibility
];

/**
 * Combined middleware for host space management
 */
export const validateHostSpaceManagement = [
  verifyHostStatus,
  verifyHostSpaceAccess
];