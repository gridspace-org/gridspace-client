import express from 'express';
const router = express.Router();

// Placeholder routes for admin functionality
// TODO: Implement actual admin routes
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Admin routes not implemented yet'
  });
});

// Test route to verify route mounting
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes are mounted and accessible!'
  });
});

export default router;
