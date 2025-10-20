import Space from '../models/Space.model.js';
import Booking from '../models/Booking.model.js';
import User from '../models/User.model.js';
import Review from '../models/Review.model.js';
import logger from '../config/logger.js';

/**
 * Verify space exists and is active
 * O(1) lookup with indexed _id query
 */
export const checkSpaceExists = async (req, res, next) => {
  try {
    const { id: spaceId } = req.params;
    
    if (!spaceId) {
      logger.warn('Space existence check called without space ID');
      return res.status(400).json({
        success: false,
        message: "Space ID is required.",
      });
    }

    // O(1) indexed query to find active space
    const space = await Space.findOne({ 
      _id: spaceId, 
      isActive: true 
    });

    if (!space) {
      logger.warn(`Space not found or inactive - Space ID: ${spaceId}`);
      return res.status(404).json({
        success: false,
        message: "Space not found or no longer available.",
      });
    }

    logger.info(`Space verified - ID: ${spaceId}, Title: ${space.title}`);
    req.space = space;
    next();
    
  } catch (error) {
    logger.error('Space existence check failed', { 
      error: error.message, 
      spaceId: req.params.id 
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during space verification.",
      error: error.message,
    });
  }
};

/**
 * Verify booking exists with valid status
 * O(1) lookup with indexed _id query
 */
export const checkBookingExists = async (req, res, next) => {
  try {
    const { id: bookingId } = req.params;
    
    if (!bookingId) {
      logger.warn('Booking existence check called without booking ID');
      return res.status(400).json({
        success: false,
        message: "Booking ID is required.",
      });
    }

    // O(1) indexed query to find booking
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'fullname email')
      .populate('spaceId', 'title hostId');

    if (!booking) {
      logger.warn(`Booking not found - Booking ID: ${bookingId}`);
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    logger.info(`Booking verified - ID: ${bookingId}, Status: ${booking.status}`);
    req.booking = booking;
    next();
    
  } catch (error) {
    logger.error('Booking existence check failed', { 
      error: error.message, 
      bookingId: req.params.id 
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during booking verification.",
      error: error.message,
    });
  }
};

/**
 * Verify user exists and is active
 * O(1) lookup with indexed _id query
 */
export const checkUserExists = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    
    if (!userId) {
      logger.warn('User existence check called without user ID');
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // O(1) indexed query to find active user
    const user = await User.findOne({ 
      _id: userId, 
      isActive: true 
    }).select('-password');

    if (!user) {
      logger.warn(`User not found or inactive - User ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "User not found or account is inactive.",
      });
    }

    logger.info(`User verified - ID: ${userId}, Role: ${user.role}`);
    req.targetUser = user; // Different name to avoid conflict with req.user
    next();
    
  } catch (error) {
    logger.error('User existence check failed', { 
      error: error.message, 
      userId: req.params.id 
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during user verification.",
      error: error.message,
    });
  }
};

/**
 * Verify review exists
 * O(1) lookup with indexed _id query
 */
export const checkReviewExists = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;
    
    if (!reviewId) {
      logger.warn('Review existence check called without review ID');
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    // O(1) indexed query to find review
    const review = await Review.findById(reviewId)
      .populate('userId', 'fullname')
      .populate('spaceId', 'title');

    if (!review) {
      logger.warn(`Review not found - Review ID: ${reviewId}`);
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    logger.info(`Review verified - ID: ${reviewId}, Rating: ${review.rating}`);
    req.review = review;
    next();
    
  } catch (error) {
    logger.error('Review existence check failed', { 
      error: error.message, 
      reviewId: req.params.id 
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during review verification.",
      error: error.message,
    });
  }
};

/**
 * Combined check for space booking eligibility
 * O(1) space existence + O(1) space active status
 */
export const checkBookableSpace = async (req, res, next) => {
  try {
    const { spaceId } = req.body;
    
    if (!spaceId) {
      logger.warn('Bookable space check called without space ID');
      return res.status(400).json({
        success: false,
        message: "Space ID is required for booking.",
      });
    }

    // O(1) indexed query to find active, bookable space
    const space = await Space.findOne({ 
      _id: spaceId, 
      isActive: true 
    });

    if (!space) {
      logger.warn(`Space not available for booking - Space ID: ${spaceId}`);
      return res.status(404).json({
        success: false,
        message: "Space not available for booking.",
      });
    }

    logger.info(`Space available for booking - ID: ${spaceId}, Price: ${space.pricePerHour}`);
    req.space = space;
    next();
    
  } catch (error) {
    logger.error('Bookable space check failed', { 
      error: error.message, 
      spaceId: req.body.spaceId 
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during space availability check.",
      error: error.message,
    });
  }
};