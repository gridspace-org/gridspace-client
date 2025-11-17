import mongoose from 'mongoose';
import Transaction from '../../models/Transaction.model.js';
import Booking from '../../models/Booking.model.js';
import User from '../../models/User.model.js';
import WalletTransaction from '../../models/WalletTransaction.model.js';
import monnifyService from '../../services/payment/monnify.service.js';
import walletService from '../../services/wallet/wallet.service.js';
import logger from '../../config/logger.js';

export const handleWebhook = async (req, res) => {
  // CRITICAL FIX #1: Start MongoDB session for atomic operations
  const session = await mongoose.startSession();
  try {
    const signature = req.headers['monnify-signature'];
    const payload = req.body;

    if (!signature || !monnifyService.validateWebhookSignature(signature, payload)) {
      logger.warn('[Webhook] Invalid signature', { ip: req.ip });
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const { eventType, eventData } = payload;

    // Handle different event types
    switch (eventType) {
      case 'SUCCESSFUL_TRANSACTION':
        return await handleSuccessfulTransaction(eventData, session, res);
      
      case 'SUCCESSFUL_DISBURSEMENT':
      case 'FAILED_DISBURSEMENT':
      case 'REVERSED_DISBURSEMENT':
        logger.info(`[Webhook] ${eventType}`, { reference: eventData.reference, amount: eventData.amount });
        return res.status(200).json({ success: true, message: 'Disbursement event logged' });
      
      case 'SUCCESSFUL_REFUND':
      case 'FAILED_REFUND':
        logger.info(`[Webhook] ${eventType}`, { 
          refundReference: eventData.refundReference,
          transactionReference: eventData.transactionReference,
          amount: eventData.refundAmount,
          status: eventData.refundStatus
        });
        return res.status(200).json({ success: true, message: 'Refund event logged' });
      
      case 'SETTLEMENT':
        logger.info('[Webhook] SETTLEMENT', { 
          settlementReference: eventData.settlementReference,
          amount: eventData.amount,
          transactionsCount: eventData.transactionsCount
        });
        return res.status(200).json({ success: true, message: 'Settlement event logged' });
      
      case 'REJECTED_PAYMENT':
        logger.warn('[Webhook] REJECTED_PAYMENT', { 
          paymentReference: eventData.paymentReference,
          reason: eventData.paymentRejectionInformation?.rejectionReason,
          expectedAmount: eventData.paymentRejectionInformation?.expectedAmount
        });
        return res.status(200).json({ success: true, message: 'Rejected payment logged' });
      
      case 'MANDATE_UPDATE':
        logger.info('[Webhook] MANDATE_UPDATE', { 
          mandateCode: eventData.mandateCode,
          status: eventData.mandateStatus,
          externalReference: eventData.externalMandateReference
        });
        return res.status(200).json({ success: true, message: 'Mandate update logged' });
      
      case 'ACCOUNT_ACTIVITY':
        logger.info('[Webhook] ACCOUNT_ACTIVITY', { 
          accountType: eventData.accountType,
          activityType: eventData.activityType,
          amount: eventData.amount,
          balanceAfter: eventData.balanceAfter
        });
        return res.status(200).json({ success: true, message: 'Account activity logged' });
      
      case 'LOW_BALANCE_ALERT':
        logger.warn('[Webhook] LOW_BALANCE_ALERT', { 
          walletBalance: eventData.walletBalance,
          threshold: eventData.lowBalanceThreshold,
          accountNumber: eventData.walletAccountNumber
        });
        return res.status(200).json({ success: true, message: 'Low balance alert logged' });
      
      default:
        logger.warn('[Webhook] Unknown event type', { eventType });
        return res.status(200).json({ success: true, message: 'Unknown event type' });
    }
  } catch (error) {
    await session.abortTransaction();
    logger.error('[Webhook] Processing failed:', { error: error.message });
    return res.status(200).json({ success: true, message: 'Error logged' });
  } finally {
    session.endSession();
  }
};

// Handler for SUCCESSFUL_TRANSACTION event
async function handleSuccessfulTransaction(eventData, session, res) {
  try {
    // Verify payment status is PAID
    if (eventData.paymentStatus !== 'PAID') {
      logger.warn('[Webhook] Non-PAID status', { status: eventData.paymentStatus });
      return res.status(200).json({ success: true, message: 'Status not PAID' });
    }

    const transaction = await Transaction.findOne({ 
      paymentReference: eventData.paymentReference 
    });

    if (!transaction) {
      logger.warn('[Webhook] Transaction not found', { 
        reference: eventData.paymentReference 
      });
      return res.status(200).json({ success: true, message: 'Transaction not found' });
    }

    // Idempotency: Skip if already processed
    if (transaction.webhookReceived) {
      return res.status(200).json({ success: true, message: 'Already processed' });
    }

    const booking = await Booking.findById(transaction.bookingId)
      .populate('spaceId')
      .populate('userId');

    if (!booking) {
      logger.error('[Webhook] Booking not found', { bookingId: transaction.bookingId });
      return res.status(200).json({ success: true, message: 'Booking not found' });
    }

    // Start transaction - all operations must succeed or all fail
    session.startTransaction();

    // Update transaction
    transaction.status = 'paid';
    transaction.paymentMethod = eventData.paymentMethod;
    transaction.paymentDate = eventData.paidOn;
    transaction.webhookReceived = true;
    transaction.webhookData = { eventType: 'SUCCESSFUL_TRANSACTION', eventData };
    await transaction.save({ session });

    // Update booking
    booking.paymentStatus = 'paid';
    booking.status = 'upcoming';
    booking.paidAt = new Date();
    await booking.save({ session });

    // WALLET INTEGRATION: Split payment
    const hostId = booking.spaceId.hostId;
    const adminUser = await User.findOne({ role: 'admin' }).session(session);

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Credit host wallet (PENDING until space approved)
    await walletService.addPendingBalance(
      hostId,
      booking.hostEarnings,
      'host_earning',
      `Booking payment for ${booking.spaceId.title}`,
      { bookingId: booking._id }
    );

    // Credit admin wallet (AVAILABLE immediately)
    await walletService.creditWallet(
      adminUser._id,
      booking.markupAmount,
      'platform_fee',
      `Platform fee from booking ${booking._id}`,
      { bookingId: booking._id }
    );

    // Commit transaction - all operations succeeded
    await session.commitTransaction();

    logger.info('[Webhook] Payment processed', {
      bookingId: booking._id,
      hostEarnings: booking.hostEarnings,
      platformFee: booking.markupAmount
    });

    return res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}
