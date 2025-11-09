import { Router } from 'express';
import authRoutes from './auth.js';
import spaceRoutes from './space.route.js';
import bookingRoutes from './bookingsRoute.js';
import adminRoutes from './adminRoute.js';
import reportRoutes from './reportsRoute.js';

const router = Router();

// API v1 routes
router.use('/auth', authRoutes);
router.use('/spaces', spaceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);

export default router;
