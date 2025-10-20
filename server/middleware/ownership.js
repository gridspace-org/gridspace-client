import Space from '../models/Space.model.js';
import Booking from '../models/Booking.model.js';
import Review from '../models/Review.model.js';
import logger from '../config/logger.js';

/**
 * Verify user owns the space they're trying to modify
 * O(1) lookup with indexed hostId comparison
 */
export const checkSpaceOwnership = async (req, res, next) => {
  try {
    const { id: spaceId } = req.params;
    const userId = req.user._id;

    if (!spaceId) {
      logger.warn('Space ownership check called without space ID', { userId });
      return res.status(400).json({
        success: false,
        message: "Space ID is required.",
      });
    }

    // O(1) indexed query to find space and verify ownership
    const space = await Space.findOne({ 
      _id: spaceId, 
      hostId: userId 
    });

    if (!space) {
      logger.warn('Space ownership verification failed', { 
        userId, 
        spaceId,
        userRole: req.user.role
      });
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't own this space or it doesn't exist.",
      });
    }

    logger.info('Space ownership verified successfully', { 
      userId, 
      spaceId, 
      spaceTitle: space.title 
    });
    
    req.space = space;
    next();
    
  } catch (error) {
    logger.error('Space ownership check failed', { 
      error: error.message, 
      spaceId: req.params.id,
      userId: req.user?._id 
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during ownership verification.",
      error: error.message,
    });
  }
};

/**
 * Verify user owns the booking they're trying to modify
 * O(1) lookup with indexed userId comparison
 */
export const checkBookingOwnership = async (req, res, next) => {
  try {
    const { id: bookingId } = req.params;
    const userId = req.user._id;

    if (!bookingId) {
      logger.warn('Booking ownership check called without booking ID', { userId });
      return res.status(400).json({
        success: false,
        message: "Booking ID is required.",
      });
    }

    // O(1) indexed query to find booking and verify ownership
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: userId
    });

    if (!booking) {
      logger.warn('Booking ownership verification failed', { 
        userId, 
        bookingId,
        userRole: req.user.role
      });
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't own this booking or it doesn't exist.",
      });
    }

    logger.info('Booking ownership verified successfully', { 
      userId, 
      bookingId, 
      bookingStatus: booking.status 
    });
    
    req.booking = booking;
    next();
    
  } catch (error) {
    logger.error('Booking ownership check failed', { 
      error: error.message, 
      bookingId: req.params.id,
      userId: req.user?._id 
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during booking ownership verification.",
      error: error.message,
    });
  }
};

/**
 * Verify user owns the review they're trying to modify
 * O(1) lookup with indexed userId comparison
 */
export const checkReviewOwnership = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;
    const userId = req.user._id;

    if (!reviewId) {
      logger.warn('Review ownership check called without review ID', { userId });
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    // O(1) indexed query to find review and verify ownership
    const review = await Review.findOne({
      _id: reviewId,
      userId: userId
    });

    if (!review) {
      logger.warn('Review ownership verification failed', { 
        userId, 
        reviewId,
        userRole: req.user.role
      });
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't own this review or it doesn't exist.",
      });
    }

    logger.info('Review ownership verified successfully', { 
      userId, 
      reviewId, 
      spaceId: review.spaceId 
    });
    
    req.review = review;
    next();
    
  } catch (error) {
    logger.error('Review ownership check failed', { 
      error: error.message, 
      reviewId: req.params.id,
      userId: req.user?._id 
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during review ownership verification.",
      error: error.message,
    });
  }
};

/**
 * Combined ownership check for host operations on their spaces' bookings
 * O(1) space ownership + O(1) space-booking relationship check
 */
export const checkHostBookingAccess = async (req, res, next) => {
  try {
    const { id: bookingId } = req.params;
    const hostId = req.user._id;

    if (!bookingId) {
      logger.warn('Host booking access check called without booking ID', { hostId });
      return res.status(400).json({
        success: false,
        message: "Booking ID is required.",
      });
    }

    // First get the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      logger.warn('Booking not found for host access check', { 
        hostId, 
        bookingId 
      });
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Check if host owns the space in the booking - O(1) indexed lookup
    const space = await Space.findOne({
      _id: booking.spaceId,
      hostId: hostId
    });

    if (!space) {
      logger.warn('Host booking access verification failed', { 
        hostId, 
        bookingId,
        spaceId: booking.spaceId
      });
      return res.status(403).json({
        success: false,
        message: "Access denied. This booking doesn't belong to your spaces.",
      });
    }

    logger.info('Host booking access verified successfully', { 
      hostId, 
      bookingId, 
      spaceId: space._id,
      bookingStatus: booking.status 
    });
    
    req.booking = booking;
    req.space = space;
    next();
    
  } catch (error) {
    logger.error('Host booking access check failed', { 
      error: error.message, 
      bookingId: req.params.id,
      hostId: req.user?._id 
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during host booking access verification.",
      error: error.message,
    });
  }
};