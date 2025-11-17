import express from 'express';
import { adminOnly } from '../middleware/roles.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Require admin for all report routes
router.use(authenticate, adminOnly());

// Reports endpoints - Not yet implemented
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Report routes not implemented yet'
  });
});

router.post('/generate', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Report generation not implemented yet'
  });
});

router.get('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Report retrieval not implemented yet'
  });
});

export default router;
