import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  getWallet,
  getTransactions,
  requestWithdrawal
} from '../controllers/wallet/index.js';
import { requestWithdrawalValidation } from '../validators/wallet.validator.js';

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Virtual wallet management and transactions
 */

const router = express.Router();

const withdrawalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many withdrawal requests' }
});

router.use(authenticate);

/**
 * @swagger
 * /api/v1/wallet:
 *   get:
 *     summary: Get user wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Wallet retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     availableBalance:
 *                       type: number
 *                       description: Balance available for withdrawal
 *                       example: 10000
 *                     pendingBalance:
 *                       type: number
 *                       description: Balance pending space approval
 *                       example: 5000
 *                     totalBalance:
 *                       type: number
 *                       description: Total balance (available + pending)
 *                       example: 15000
 *                     currency:
 *                       type: string
 *                       example: "NGN"
 *                     dailyWithdrawalLimit:
 *                       type: number
 *                       example: 50000
 *                     monthlyWithdrawalLimit:
 *                       type: number
 *                       example: 500000
 *       404:
 *         description: Wallet not found
 */
router.get('/', getWallet);

/**
 * @swagger
 * /api/v1/wallet/transactions:
 *   get:
 *     summary: Get wallet transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [booking_payment, host_earning, platform_fee, withdrawal, refund, deposit]
 *         description: Filter by transaction category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed]
 *         description: Filter by transaction status
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transactions retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [credit, debit]
 *                           category:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           balanceBefore:
 *                             type: number
 *                           balanceAfter:
 *                             type: number
 *                           status:
 *                             type: string
 *                           description:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 */
router.get('/transactions', getTransactions);

/**
 * @swagger
 * /api/v1/wallet/withdraw:
 *   post:
 *     summary: Request withdrawal to bank account
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - accountNumber
 *               - accountName
 *               - bankName
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 500
 *                 maximum: 1000000
 *                 description: Amount to withdraw (min ₦500)
 *                 example: 10000
 *               accountNumber:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: 10-digit bank account number
 *                 example: "0123456789"
 *               accountName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: Account holder name
 *                 example: "John Doe"
 *               bankName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: Bank name
 *                 example: "GTBank"
 *               bankCode:
 *                 type: string
 *                 description: Bank code (optional)
 *                 example: "058"
 *     responses:
 *       201:
 *         description: Withdrawal request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Withdrawal request submitted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                       example: "WD-1234567890-60f7b3b3b3b3b3b3b3b3b3b3"
 *                     amount:
 *                       type: number
 *                       example: 10000
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     bankAccount:
 *                       type: object
 *                       properties:
 *                         accountNumber:
 *                           type: string
 *                         accountName:
 *                           type: string
 *                         bankName:
 *                           type: string
 *       400:
 *         description: Insufficient balance or validation error
 */
router.post('/withdraw', withdrawalLimiter, validate(requestWithdrawalValidation), requestWithdrawal);

export default router;
