import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createBooking,
  getUserBookings,
  getHostBookings,
  updateBookingStatus,
  cancelBooking
} from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { checkBookingConflicts } from '../middleware/bookingChecks.js';
import { createBookingValidation } from '../validators/booking.validator.js';

// Validation middleware for booking creation
const validateBooking = (req, res, next) => {
  const { error } = createBookingValidation.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

const router = express.Router();

// Rate limiting configurations
const bookingCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 booking creations per windowMs
  message: {
    success: false,
    message: 'Too many booking attempts. Please try again later.'
  }
});

const bookingQueriesLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 booking queries per minute
  message: {
    success: false,
    message: 'Too many booking requests. Please slow down.'
  }
});

// User booking routes - require authentication
router.get('/', authenticate, bookingQueriesLimiter, getUserBookings);
router.post('/', authenticate, bookingCreationLimiter, validateBooking, createBooking);
router.delete('/:id/cancel', authenticate, checkBookingConflicts, cancelBooking);

// Host booking routes - require host role
router.get('/host', authenticate, requireRole('host'), bookingQueriesLimiter, getHostBookings);
router.put('/:id/status', authenticate, requireRole('host'), checkBookingConflicts, updateBookingStatus);

export default router;
