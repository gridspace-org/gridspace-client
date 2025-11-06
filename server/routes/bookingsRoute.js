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
import validate from '../middleware/validate.js';
import {
  createBookingValidation,
  updateBookingStatusValidation,
} from '../validators/booking.validator.js';

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking lifecycle management endpoints
 * 
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the booking
 *         space:
 *           type: string
 *           description: Reference to the booked Space
 *         user:
 *           type: string
 *           description: Reference to the User who made the booking
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Start time of the booking
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: End time of the booking
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *           default: pending
 *         totalPrice:
 *           type: number
 *           description: Total price for the booking
 *         guests:
 *           type: number
 *           description: Number of guests
 *         specialRequests:
 *           type: string
 *           description: Any special requests for the booking
 *         cancellationReason:
 *           type: string
 *           description: Reason for cancellation if applicable
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const router = express.Router();

// Rate limiting configurations
const bookingCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 booking creations per windowMs
  message: {
    success: false,
    message: 'Too many booking attempts. Please try again later.',
  },
});

const bookingQueriesLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 booking queries per minute
  message: {
    success: false,
    message: 'Too many booking requests. Please slow down.',
  },
});

// User booking routes - require authentication

/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: List bookings belonging to the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, upcoming, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Paginated list of user bookings
 */
router.get('/', authenticate, bookingQueriesLimiter, getUserBookings);

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a booking for a space
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spaceId
 *               - startTime
 *               - endTime
 *               - guestCount
 *             properties:
 *               spaceId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               guestCount:
 *                 type: integer
 *               bookingType:
 *                 type: string
 *                 enum: [hourly, daily]
 *               specialRequests:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Booking conflict
 */
router.post(
  '/',
  authenticate,
  bookingCreationLimiter,
  validate(createBookingValidation),
  createBooking
);

/**
 * @swagger
 * /api/v1/bookings/{id}/cancel:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       400:
 *         description: Cannot cancel booking
 *       404:
 *         description: Booking not found
 */
router.delete('/:id/cancel', authenticate, checkBookingConflicts, cancelBooking);

// Host booking routes - require host role

/**
 * @swagger
 * /api/v1/bookings/host:
 *   get:
 *     summary: Retrieve bookings for spaces owned by the host
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: spaceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Host bookings
 *       403:
 *         description: Forbidden
 */
router.get(
  '/host',
  authenticate,
  requireRole('host'),
  bookingQueriesLimiter,
  getHostBookings
);

/**
 * @swagger
 * /api/v1/bookings/{id}/status:
 *   put:
 *     summary: Update booking status (host only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, upcoming, in_progress, completed, cancelled]
 *               hostNotes:
 *                 type: string
 *               cancellationReason:
 *                 type: string
 *                 enum: [user_request, host_request, payment_timeout, other]
 *     responses:
 *       200:
 *         description: Booking updated
 *       400:
 *         description: Invalid update
 *       404:
 *         description: Booking not found
 */
router.put(
  '/:id/status',
  authenticate,
  requireRole('host'),
  validate(updateBookingStatusValidation),
  checkBookingConflicts,
  updateBookingStatus
);

export default router;
