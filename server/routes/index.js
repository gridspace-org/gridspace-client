import { Router } from 'express';
import authRoutes from './auth.js';
import spaceRoutes from './space.route.js';
import bookingRoutes from './bookingsRoute.js';
import adminRoutes from './adminRoute.js';
import reportRoutes from './reportsRoute.js';
import paymentRoutes from './payment.route.js';
import walletRoutes from './wallet.route.js';
import adminWithdrawalRoutes from './admin/withdrawal.route.js';

const router = Router();

// API v1 routes
router.use('/auth', authRoutes);
router.use('/spaces', spaceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/payments', paymentRoutes);
router.use('/wallet', walletRoutes);
router.use('/admin/withdrawals', adminWithdrawalRoutes);

export default router;
