import Review from '../models/Review.model.js';
import Booking from '../models/Booking.model.js';
import logger from '../config/logger.js';

/**
 * Verify user is eligible to review a space (has completed booking)
 * O(1) lookup with indexed userId + spaceId query
 */
export const checkReviewEligibility = async (req, res, next) => {
  try {
    const { spaceId } = req.body;
    const userId = req.user._id;

    if (!spaceId) {
      logger.warn('Review eligibility check called without space ID', { userId });
      return res.status(400).json({
        success: false,
        message: "Space ID is required to submit a review.",
      });
    }

    // O(1) indexed query to find completed booking for this user and space
    const eligibleBooking = await Booking.findOne({
      userId,
      spaceId,
      status: 'completed',
      endTime: { $lt: new Date() } // Booking has ended
    });

    if (!eligibleBooking) {
      logger.warn('User not eligible to review space', {
        userId,
        spaceId,
        userRole: req.user.role
      });
      return res.status(403).json({
        success: false,
        message: "You can only review spaces you have booked and completed.",
      });
    }

    // Check if review period is still valid (e.g., within 30 days of booking end)
    const reviewPeriodDays = 30;
    const lastReviewDate = new Date(eligibleBooking.endTime);
    lastReviewDate.setDate(lastReviewDate.getDate() + reviewPeriodDays);
    
    if (new Date() > lastReviewDate) {
      logger.warn('Review period expired for user', {
        userId,
        spaceId,
        bookingEndTime: eligibleBooking.endTime,
        lastReviewDate: lastReviewDate.toISOString()
      });
      return res.status(400).json({
        success: false,
        message: `Review period has expired. Reviews must be submitted within ${reviewPeriodDays} days of booking completion.`,
      });
    }

    logger.info('User eligible to review space', {
      userId,
      spaceId,
      bookingId: eligibleBooking._id,
      bookingEndTime: eligibleBooking.endTime
    });

    // Attach eligible booking for downstream use
    req.eligibleBooking = eligibleBooking;
    next();
    
  } catch (error) {
    logger.error('Review eligibility check failed', {
      error: error.message,
      spaceId: req.body.spaceId,
      userId: req.user?._id
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during review eligibility verification.",
      error: error.message,
    });
  }
};

/**
 * Prevent duplicate reviews for the same booking
 * O(1) lookup with unique compound index { userId: 1, spaceId: 1 }
 */
export const preventDuplicateReviews = async (req, res, next) => {
  try {
    const { spaceId } = req.body;
    const userId = req.user._id;

    if (!spaceId) {
      logger.warn('Duplicate review check called without space ID', { userId });
      return res.status(400).json({
        success: false,
        message: "Space ID is required.",
      });
    }

    // O(1) indexed query using unique compound index
    const existingReview = await Review.findOne({
      userId,
      spaceId
    });

    if (existingReview) {
      logger.warn('Duplicate review attempt detected', {
        userId,
        spaceId,
        existingReviewId: existingReview._id
      });
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this space. You can edit your existing review instead.",
        existingReviewId: existingReview._id
      });
    }

    logger.info('No duplicate review found', {
      userId,
      spaceId
    });

    next();
    
  } catch (error) {
    logger.error('Duplicate review check failed', {
      error: error.message,
      spaceId: req.body.spaceId,
      userId: req.user?._id
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during duplicate review check.",
      error: error.message,
    });
  }
};

/**
 * Validate review content and rating
 * O(1) validation checks
 */
export const validateReviewContent = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    // Validate rating is provided and within range
    if (!rating || typeof rating !== 'number') {
      logger.warn('Review validation failed - rating missing or invalid', {
        userId: req.user._id,
        ratingProvided: rating
      });
      return res.status(400).json({
        success: false,
        message: "Rating is required and must be a number.",
      });
    }

    if (rating < 1 || rating > 5) {
      logger.warn('Review validation failed - rating out of range', {
        userId: req.user._id,
        ratingProvided: rating
      });
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    if (!Number.isInteger(rating)) {
      logger.warn('Review validation failed - rating not integer', {
        userId: req.user._id,
        ratingProvided: rating
      });
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number (1, 2, 3, 4, or 5).",
      });
    }

    // Validate comment length if provided
    if (comment && comment.length > 1000) {
      logger.warn('Review validation failed - comment too long', {
        userId: req.user._id,
        commentLength: comment.length
      });
      return res.status(400).json({
        success: false,
        message: "Review comment cannot exceed 1000 characters.",
      });
    }

    // Validate aspect ratings if provided
    const { aspects } = req.body;
    if (aspects) {
      const validAspects = ['cleanliness', 'accuracy', 'value'];
      const invalidAspects = Object.keys(aspects).filter(
        key => !validAspects.includes(key)
      );

      if (invalidAspects.length > 0) {
        logger.warn('Review validation failed - invalid aspects provided', {
          userId: req.user._id,
          invalidAspects
        });
        return res.status(400).json({
          success: false,
          message: `Invalid aspect ratings provided: ${invalidAspects.join(', ')}. Valid aspects are: ${validAspects.join(', ')}.`,
        });
      }

      // Validate aspect rating values
      for (const [aspect, value] of Object.entries(aspects)) {
        if (value < 1 || value > 5 || !Number.isInteger(value)) {
          logger.warn('Review validation failed - invalid aspect rating value', {
            userId: req.user._id,
            aspect,
            valueProvided: value
          });
          return res.status(400).json({
            success: false,
            message: `Aspect rating '${aspect}' must be a whole number between 1 and 5.`,
          });
        }
      }
    }

    logger.info('Review content validated successfully', {
      userId: req.user._id,
      rating,
      hasComment: !!comment,
      hasAspects: !!aspects
    });

    next();
    
  } catch (error) {
    logger.error('Review content validation failed', {
      error: error.message,
      userId: req.user?._id
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during review content validation.",
      error: error.message,
    });
  }
};

/**
 * Check if review can be edited based on timing and responses
 * O(1) timing and status checks
 */
export const checkReviewModifiable = async (req, res, next) => {
  try {
    const review = req.review; // From previous middleware
    
    if (!review) {
      logger.warn('Review modification check called without review context');
      return res.status(400).json({
        success: false,
        message: "Review context required.",
      });
    }

    // Check if host has already responded to the review
    if (review.hostResponse && review.hostResponse.text) {
      logger.warn('Attempt to modify review with host response', {
        reviewId: review._id,
        hostResponseDate: review.hostResponse.respondedAt
      });
      return res.status(400).json({
        success: false,
        message: "Cannot edit review after host has responded. Please contact support for modifications.",
      });
    }

    // Check if review is too old to edit (e.g., 7 days limit)
    const editPeriodDays = 7;
    const lastEditDate = new Date(review.createdAt);
    lastEditDate.setDate(lastEditDate.getDate() + editPeriodDays);
    
    if (new Date() > lastEditDate) {
      logger.warn('Attempt to edit old review', {
        reviewId: review._id,
        reviewDate: review.createdAt,
        lastEditDate: lastEditDate.toISOString()
      });
      return res.status(400).json({
        success: false,
        message: `Review can only be edited within ${editPeriodDays} days of submission.`,
      });
    }

    logger.info('Review modification allowed', {
      reviewId: review._id,
      createdAt: review.createdAt,
      hasHostResponse: !!(review.hostResponse && review.hostResponse.text)
    });

    next();
    
  } catch (error) {
    logger.error('Review modification check failed', {
      error: error.message,
      reviewId: req.review?._id
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error during review modification check.",
      error: error.message,
    });
  }
};

/**
 * Combined middleware for new review creation
 */
export const validateNewReview = [
  checkReviewEligibility,
  preventDuplicateReviews,
  validateReviewContent
];

/**
 * Combined middleware for review modification
 */
export const validateReviewUpdate = [
  checkReviewModifiable,
  validateReviewContent
];