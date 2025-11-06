import express from "express";

import { adminOnly } from "../middleware/roles.js";
import { adminActionLogger } from "../middleware/adminActionLog.js";
import {
  listUsers,
  listSpaces,
  listBookings,
  suspendUser,
  reactivateUser,
  approveSpace,
  rejectSpace,
} from "../controllers/admin.controller.js";
import validate from "../middleware/validate.js";
import {
  suspendUserValidation,
  reactivateUserValidation,
  approveSpaceValidation,
  rejectSpaceValidation,
} from "../validators/admin.validator.js";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only moderation and review endpoints
 * 
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Admin JWT token
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         fullname:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, host, admin]
 *         isActive:
 *           type: boolean
 *         isVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Space:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, suspended]
 *         host:
 *           type: string
 *           description: Reference to the User who owns the space
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         space:
 *           type: string
 *           description: Reference to the booked Space
 *         user:
 *           type: string
 *           description: Reference to the User who made the booking
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         totalPrice:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const router = express.Router();

// Apply admin only and logging middleware to all admin routes
router.use(adminOnly());
router.use(adminActionLogger);

/**
 * @swagger
 * /api/v1/admin/health:
 *   get:
 *     summary: Admin route heartbeat
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin routes reachable
 */

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Admin routes reachable.",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List users with admin filters
 *     tags: [Admin]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, host, admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated users
 */
router.get("/users", listUsers);

/**
 * @swagger
 * /api/v1/admin/spaces:
 *   get:
 *     summary: List spaces for moderation
 *     tags: [Admin]
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
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: hostId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated spaces
 */
router.get("/spaces", listSpaces);

/**
 * @swagger
 * /api/v1/admin/bookings:
 *   get:
 *     summary: List bookings from admin perspective
 *     tags: [Admin]
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
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: hostId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated bookings
 */
router.get("/bookings", listBookings);

/**
 * @swagger
 * /api/v1/admin/users/{id}/suspend:
 *   post:
 *     summary: Suspend a user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *               details:
 *                 type: string
 *               resumeAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: User suspended
 */
router.post(
  "/users/:id/suspend",
  validate(suspendUserValidation),
  suspendUser
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/reactivate:
 *   post:
 *     summary: Reactivate a suspended user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User reactivated
 */
router.post(
  "/users/:id/reactivate",
  validate(reactivateUserValidation),
  reactivateUser
);

/**
 * @swagger
 * /api/v1/admin/spaces/{id}/approve:
 *   post:
 *     summary: Approve a pending space
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Space approved
 */
router.post(
  "/spaces/:id/approve",
  validate(approveSpaceValidation),
  approveSpace
);

/**
 * @swagger
 * /api/v1/admin/spaces/{id}/reject:
 *   post:
 *     summary: Reject a pending space
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Space rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/spaces/:id/reject", validate(rejectSpaceValidation), rejectSpace);

export default router;
