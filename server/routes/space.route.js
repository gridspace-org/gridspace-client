import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { createSpace } from "../controllers/spaces/createSpace.controller.js";
import { searchSpaces as getSpaces } from "../controllers/spaces/searchSpaces.controller.js";
import {
  getSpaceDetails as getSpace,
  updateSpace,
  deleteSpace,
  getHostSpaces as getMySpaces,
} from "../controllers/spaces/manageSpaces.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  validateHostSpaceCreation,
  validateHostSpaceManagement,
} from "../middleware/hostVerification.js";
import { checkSpaceExists } from "../middleware/resources.js";
import { checkSpaceOwnership } from "../middleware/ownership.js";
import validate from "../middleware/validate.js";
import {
  createSpaceValidation,
  updateSpaceValidation,
  searchSpacesValidation,
} from "../validators/space.validator.js";

/**
 * @swagger
 * tags:
 *   name: Spaces
 *   description: Endpoints for browsing and managing spaces
 */

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Rate limiting configurations
const createSpaceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 space creations per windowMs
  message: {
    success: false,
    message: "Too many spaces created. Please try again later.",
  },
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 searches per minute
  message: {
    success: false,
    message: "Too many search requests. Please slow down.",
  },
});

// Public routes

/**
 * @swagger
 * /api/v1/spaces:
 *   get:
 *     summary: List spaces with optional filters
 *     tags: [Spaces]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: number
 *       - in: query
 *         name: purposes
 *         schema:
 *           type: string
 *         description: Comma separated list of purposes
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: Comma separated list of amenities
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 12
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of spaces
 */
router.get(
  "/",
  searchLimiter,
  (req, res, next) => {
    const { error } = searchSpacesValidation.validate(req.query, {
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: error.details.map((d) => d.message),
      });
    }
    next();
  },
  getSpaces
);

/**
 * @swagger
 * /api/v1/spaces/{id}:
 *   get:
 *     summary: Retrieve details of a specific space
 *     tags: [Spaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Space ID
 *     responses:
 *       200:
 *         description: Space details
 *       404:
 *         description: Space not found
 */
/**
 * @swagger
 * /api/v1/spaces/{id}:
 *   get:
 *     summary: Retrieve details of a specific space
 *     tags: [Spaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Space ID
 *     responses:
 *       200:
 *         description: Space details
 *       404:
 *         description: Space not found
 */
router.get("/:id", getSpace);

/**
 * @swagger
 * /api/v1/spaces/my/spaces:
 *   get:
 *     summary: Get spaces owned by authenticated host
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *     responses:
 *       200:
 *         description: Host spaces retrieved
 *       403:
 *         description: Forbidden - host role required
 */
router.get("/my/spaces", authenticate, requireRole("host"), getMySpaces);

// Protected routes - require authentication
router.use(authenticate);

// Host-only routes
/**
 * @swagger
 * /api/v1/spaces:
 *   post:
 *     summary: Create a new space (host only)
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *               - pricePerHour
 *               - capacity
 *               - timeSlots
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               pricePerHour:
 *                 type: number
 *               pricePerDay:
 *                 type: number
 *               pricePerWeek:
 *                 type: number
 *               pricePerMonth:
 *                 type: number
 *               availableBookingTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [hourly, daily, weekly, monthly]
 *               capacity:
 *                 type: number
 *               purposes:
 *                 type: array
 *                 items:
 *                   type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               timeSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - day
 *                     - startTime
 *                     - endTime
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                       description: Day of the week
 *                     startTime:
 *                       type: string
 *                       pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       description: Start time in 24-hour format (HH:MM)
 *                       example: '09:00'
 *                     endTime:
 *                       type: string
 *                       pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       description: End time in 24-hour format (HH:MM)
 *                       example: '18:00'
 *                   description: Available time slots for this space
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Space created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  createSpaceLimiter,
  requireRole("host"),
  validateHostSpaceCreation,
  upload.array("images", 5), // Max 5 images
  validate(createSpaceValidation),
  createSpace
);

/**
 * @swagger
 * /api/v1/spaces/{id}:
 *   put:
 *     summary: Update a space (host only)
 *     tags: [Spaces]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               pricePerHour:
 *                 type: number
 *               pricePerDay:
 *                 type: number
 *               pricePerWeek:
 *                 type: number
 *               pricePerMonth:
 *                 type: number
 *               availableBookingTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [hourly, daily, weekly, monthly]
 *               capacity:
 *                 type: number
 *               purposes:
 *                 type: array
 *                 items:
 *                   type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               timeSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - day
 *                     - startTime
 *                     - endTime
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                       description: Day of the week
 *                     startTime:
 *                       type: string
 *                       pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       description: Start time in 24-hour format (HH:MM)
 *                       example: '09:00'
 *                     endTime:
 *                       type: string
 *                       pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       description: End time in 24-hour format (HH:MM)
 *                       example: '18:00'
 *                   description: Available time slots for this space
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Space updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Space not found
 */
router.put(
  "/:id",
  requireRole("host"),
  checkSpaceExists,
  checkSpaceOwnership,
  upload.array("images", 5),
  validate(updateSpaceValidation),
  updateSpace
);

/**
 * @swagger
 * /api/v1/spaces/{id}:
 *   delete:
 *     summary: Delete a space (host only)
 *     tags: [Spaces]
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
 *         description: Space deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Space not found
 */
router.delete(
  "/:id",
  requireRole("host"),
  checkSpaceExists,
  checkSpaceOwnership,
  deleteSpace
);

export default router;
