import express from 'express';
import { adminOnly } from '../../middleware/roles.js';
import {
  listWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
} from '../../controllers/admin/withdrawal/index.js';

/**
 * @swagger
 * tags:
 *   name: Admin - Withdrawals
 *   description: Admin endpoints for managing withdrawal requests
 */

const router = express.Router();

router.use(adminOnly());

/**
 * @swagger
 * /api/v1/admin/withdrawals:
 *   get:
 *     summary: List all withdrawal requests
 *     tags: [Admin - Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled]
 *         description: Filter by withdrawal status
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
 *     responses:
 *       200:
 *         description: Withdrawals retrieved successfully
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
 *                   example: "Withdrawals retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     withdrawals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               fullname:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           amount:
 *                             type: number
 *                           bankAccount:
 *                             type: object
 *                             properties:
 *                               accountNumber:
 *                                 type: string
 *                               accountName:
 *                                 type: string
 *                               bankName:
 *                                 type: string
 *                           status:
 *                             type: string
 *                           reference:
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
 *       403:
 *         description: Admin access required
 */
router.get('/', listWithdrawals);

/**
 * @swagger
 * /api/v1/admin/withdrawals/{id}/approve:
 *   post:
 *     summary: Approve a withdrawal request
 *     tags: [Admin - Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionReference:
 *                 type: string
 *                 description: Bank transaction reference
 *                 example: "TXN123456789"
 *               notes:
 *                 type: string
 *                 description: Admin notes
 *                 example: "Paid via bank transfer"
 *     responses:
 *       200:
 *         description: Withdrawal approved successfully
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
 *                   example: "Withdrawal approved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     processedBy:
 *                       type: string
 *                     processedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Withdrawal already processed
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Withdrawal not found
 */
router.post('/:id/approve', approveWithdrawal);

/**
 * @swagger
 * /api/v1/admin/withdrawals/{id}/reject:
 *   post:
 *     summary: Reject a withdrawal request and refund to wallet
 *     tags: [Admin - Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal ID
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
 *                 description: Reason for rejection
 *                 example: "Invalid account details"
 *     responses:
 *       200:
 *         description: Withdrawal rejected, funds refunded to wallet
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
 *                   example: "Withdrawal rejected, funds refunded to wallet"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "failed"
 *                     failureReason:
 *                       type: string
 *                     processedBy:
 *                       type: string
 *                     processedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Withdrawal already processed or missing reason
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Withdrawal not found
 */
router.post('/:id/reject', rejectWithdrawal);

export default router;
