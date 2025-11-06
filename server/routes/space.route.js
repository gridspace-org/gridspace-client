import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import {
  createSpace,
  getSpaces,
  getSpace,
  updateSpace,
  deleteSpace,
  getMySpaces
} from '../controllers/space.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateHostSpaceCreation, validateHostSpaceManagement } from '../middleware/hostVerification.js';
import { checkSpaceExists } from '../middleware/resources.js';
import { checkSpaceOwnership } from '../middleware/ownership.js';
import validate from '../middleware/validate.js';
import {
  createSpaceValidation,
  updateSpaceValidation,
} from '../validators/space.validator.js';

/**
 * @swagger
 * tags:
 *   name: Spaces
 *   description: Endpoints for browsing and managing spaces
 * 
 * @swagger
 * components:
 *   schemas:
 *     Space:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the space
 *         name:
 *           type: string
 *           description: The name of the space
 *         description:
 *           type: string
 *           description: Detailed description of the space
 *         capacity:
 *           type: number
 *           description: Maximum number of people the space can accommodate
 *         pricePerHour:
 *           type: number
 *           description: Price per hour in the local currency
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         host:
 *           type: string
 *           description: Reference to the User who owns the space
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Rate limiting configurations
const createSpaceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 space creations per windowMs
  message: {
    success: false,
    message: 'Too many spaces created. Please try again later.'
  }
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 searches per minute
  message: {
    success: false,
    message: 'Too many search requests. Please slow down.'
  }
});

// Public routes

/**
 * @swagger
 * /api/spaces:
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
router.get('/', searchLimiter, getSpaces);

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
router.get('/:id', getSpace);

// Protected routes - require authentication
router.use(authenticate);

// Host-only routes

/**
 * @swagger
 * /api/spaces:
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               pricePerHour:
 *                 type: number
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
  '/',
  createSpaceLimiter,
  requireRole('host'),
  validateHostSpaceCreation,
  upload.array('images', 5), // Max 5 images
  validate(createSpaceValidation),
  createSpace
);

/**
 * @swagger
 * /api/v1/spaces/my-spaces:
 *   get:
 *     summary: List spaces owned by authenticated host
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of owned spaces
 */
router.get('/my/spaces', requireRole('host'), getMySpaces);

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
  '/:id',
  requireRole('host'),
  checkSpaceExists,
  checkSpaceOwnership,
  upload.array('images', 5),
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
  '/:id',
  requireRole('host'),
  checkSpaceExists,
  checkSpaceOwnership,
  deleteSpace
);

export default router;