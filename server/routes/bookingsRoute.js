import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createBooking
} from '../controllers/bookings/createBooking.controller.js';
import { getUserBookings } from '../controllers/bookings/getUserBookings.controller.js';
import { getHostBookings } from '../controllers/bookings/getHostBookings.controller.js';
import { updateBookingStatus } from '../controllers/bookings/updateBookingStatus.controller.js';
import { cancelBooking } from '../controllers/bookings/cancelBooking.controller.js';
import { getBookingById } from '../controllers/bookings/getBookingById.controller.js';
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
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get specific booking details
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       403:
 *         description: Forbidden - not authorized to view this booking
 *       404:
 *         description: Booking not found
 */
router.get('/:id', authenticate, getBookingById);

/**
 * @swagger
 * /api/v1/bookings/me:
 *   get:
 *     summary: List bookings for the authenticated user (alias for /api/v1/bookings)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 */
router.get('/me', authenticate, bookingQueriesLimiter, getUserBookings);

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
 *                 enum: [hourly, daily, weekly, monthly]
 *                 description: Optional - auto-selected based on duration if not provided
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
