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
router.get('/', searchLimiter, getSpaces);
router.get('/:id', getSpace);

// Protected routes - require authentication
router.use(authenticate);

// Host-only routes
router.post(
  '/',
  createSpaceLimiter,
  requireRole('host'),
  validateHostSpaceCreation,
  upload.array('images', 5), // Max 5 images
  createSpace
);

router.get(
  '/my/spaces',
  requireRole('host'),
  getMySpaces
);

router.put(
  '/:id',
  requireRole('host'),
  checkSpaceExists,
  checkSpaceOwnership,
  upload.array('images', 5),
  updateSpace
);

router.delete(
  '/:id',
  requireRole('host'),
  checkSpaceExists,
  checkSpaceOwnership,
  deleteSpace
);

export default router;