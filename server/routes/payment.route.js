import express from "express";
import { authenticate } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { webhookRateLimit } from "../middleware/rateLimits.js";
import {
  initializePayment,
  verifyPayment,
  handleWebhook,
} from "../controllers/payment/index.js";
import { initializePaymentValidation } from "../validators/payment.validator.js";

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and Monnify integration endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/payments/initialize:
 *   post:
 *     summary: Initialize payment for a booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: ID of the booking to pay for
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Payment initialized successfully
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
 *                   example: "Payment initialized successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     checkoutUrl:
 *                       type: string
 *                       example: "https://sandbox.monnify.com/checkout/..."
 *                     paymentReference:
 *                       type: string
 *                       example: "GS-1234567890-60f7b3b3b3b3b3b3b3b3b3b3"
 *                     transactionReference:
 *                       type: string
 *                       example: "MNFY|20|20250113..."
 *                     amount:
 *                       type: number
 *                       example: 11500
 *       400:
 *         description: Invalid booking or already paid
 *       403:
 *         description: Unauthorized to pay for this booking
 *       404:
 *         description: Booking not found
 */
router.post(
  "/initialize",
  authenticate,
  validate(initializePaymentValidation),
  initializePayment
);

/**
 * @swagger
 * /api/v1/payments/verify/{paymentReference}:
 *   get:
 *     summary: Verify payment status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentReference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference to verify
 *         example: "GS-1234567890-60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Payment verification result
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
 *                   example: "Payment verified"
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentStatus:
 *                       type: string
 *                       enum: [pending, paid, failed]
 *                       example: "paid"
 *                     amount:
 *                       type: number
 *                       example: 11500
 *                     paymentMethod:
 *                       type: string
 *                       example: "CARD"
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.get("/verify/:paymentReference", authenticate, verifyPayment);

/**
 * @swagger
 * /api/v1/payments/monnify/webhook:
 *   post:
 *     summary: Monnify payment webhook (internal use)
 *     tags: [Payments]
 *     description: Webhook endpoint for Monnify payment notifications. Validates signature and processes payment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 type: string
 *                 example: "SUCCESSFUL_TRANSACTION"
 *               eventData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 *       401:
 *         description: Invalid signature
 */
router.post("/monnify/webhook", webhookRateLimit, handleWebhook);

export default router;
