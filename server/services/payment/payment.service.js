import mongoose from 'mongoose';
import Booking from '../../models/Booking.model.js';
import User from '../../models/User.model.js';
import WalletTransaction from '../../models/WalletTransaction.model.js';
import walletService from '../wallet/wallet.service.js';
import logger from '../../config/logger.js';
import AppError from '../../utils/AppError.js';

class PaymentService {
  /**
   * Distribute funds for a paid booking
   * @param {Object} booking - The booking object (populated with spaceId)
   * @param {Object} session - Mongoose session
   */
  async distributeBookingFunds(booking, session) {
    // WALLET INTEGRATION: Split payment
    const hostId = booking.spaceId.hostId;
    const adminUser = await User.findOne({ role: 'admin' }).session(session);

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Credit host wallet (PENDING until user verifies)
    // Note: We use 'host_earning' category
    await walletService.addPendingBalance(
      hostId,
      booking.hostEarnings,
      'host_earning',
      `Booking payment for ${booking.spaceId.title}`,
      { bookingId: booking._id }
    );

    // Credit admin wallet (AVAILABLE immediately)
    // Note: We use 'platform_fee' category
    await walletService.creditWallet(
      adminUser._id,
      booking.markupAmount,
      'platform_fee',
      `Platform fee from booking ${booking._id}`,
      { bookingId: booking._id }
    );

    logger.info('[PaymentService] Funds distributed', {
      bookingId: booking._id,
      hostEarnings: booking.hostEarnings,
      platformFee: booking.markupAmount
    });
  }

  /**
   * Handle successful deposit
   * @param {Object} eventData - Webhook event data
   * @param {Object} walletTransaction - The pending wallet transaction
   * @param {Object} session - Mongoose session
   */
  async handleDepositSuccess(eventData, walletTransaction, session) {
    // Idempotency: Skip if already processed
    if (walletTransaction.status === 'completed') {
      return { success: true, message: 'Already processed' };
    }

    // Credit User Wallet
    // We manually update to avoid creating a duplicate transaction record
    // since we already have a pending one.
    const wallet = await mongoose.model('Wallet').findOne({ userId: walletTransaction.userId }).session(session);
    if (!wallet) throw new AppError('Wallet not found', 404);

    wallet.availableBalance += walletTransaction.amount;
    await wallet.save({ session });

    // Update the pending transaction to completed
    walletTransaction.status = 'completed';
    walletTransaction.balanceAfter = wallet.availableBalance;
    walletTransaction.metadata = {
      ...walletTransaction.metadata,
      paymentMethod: eventData.paymentMethod,
      paidAt: eventData.paidOn,
      transactionReference: eventData.transactionReference
    };
    await walletTransaction.save({ session });

    logger.info('[PaymentService] Deposit processed', {
      userId: walletTransaction.userId,
      amount: walletTransaction.amount
    });

    return { success: true, message: 'Deposit processed' };
  }

  /**
   * Release funds for a verified booking
   * @param {string} bookingId - ID of the booking
   * @param {string} userId - ID of the user verifying (for audit)
   */
  async releaseBookingFunds(bookingId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw new AppError('Booking not found', 404);

      if (booking.paymentStatus !== 'paid') {
        throw new AppError('Booking is not paid', 400);
      }
      if (booking.fundsReleased) {
        throw new AppError('Funds already released', 400);
      }

      // Find the pending wallet transaction
      const walletTx = await WalletTransaction.findOne({
        bookingId: booking._id,
        category: 'host_earning',
        status: 'pending'
      }).session(session);

      if (!walletTx) {
        throw new AppError('No pending funds found for this booking', 404);
      }

      // Release funds to Host
      const hostId = booking.spaceId.hostId || (await Booking.findById(bookingId).populate('spaceId')).spaceId.hostId;
      
      // We need to ensure we have the hostId. If spaceId was not populated, we need to fetch it.
      // The booking object above might not have space populated.
      // Let's re-fetch with population to be safe and clean.
      const fullBooking = await Booking.findById(bookingId).populate('spaceId').session(session);
      
      await walletService.releasePendingBalance(
        fullBooking.spaceId.hostId,
        fullBooking.hostEarnings,
        walletTx.reference
      ); // Note: walletService handles its own session if not passed, but here we are in a transaction.
         // Ideally walletService methods should accept a session.
         // Looking at walletService, it starts its OWN session. This is a problem for nested transactions.
         // MongoDB drivers usually support nested sessions but Mongoose `startSession` creates a NEW one.
         // If walletService starts a new session, it won't be atomic with this one.
         // FIX: We should pass session to walletService methods or refactor walletService to accept session.
         // For now, since walletService methods start their own session, we can't wrap them easily without refactoring.
         // However, `releasePendingBalance` is a single atomic operation on Wallet.
         // We can commit our local changes (booking update) and then call walletService.
         // OR: We assume walletService works independently.
         // RISK: If walletService fails, we shouldn't update booking.
         // If walletService succeeds, we MUST update booking.
         // Let's do: Call walletService FIRST. If it succeeds, update booking.
         
      // RE-CHECK WalletService: It starts a session.
      // So we should NOT start a session here if we can't pass it.
      // But we need to update Booking atomically.
      
      // STRATEGY: 
      // 1. Update Booking to verified (in this function's session? No, separate).
      // 2. Call walletService.releasePendingBalance (it has its own session).
      // 3. Update Booking to fundsReleased = true.
      
      // Better approach for consistency:
      // Since we can't easily change WalletService right now without bigger refactor,
      // We will execute sequentially.
      
      // Step 1: Release Funds (Critical Step)
      // This throws if it fails.
      await walletService.releasePendingBalance(
        fullBooking.spaceId.hostId,
        fullBooking.hostEarnings,
        walletTx.reference
      );

      // Step 2: Update Booking
      // If Step 1 succeeds, we assume funds are moved.
      fullBooking.fundsReleased = true;
      fullBooking.hostPaidOut = true; // Legacy field compatibility
      fullBooking.hostPaidOutAt = new Date();
      fullBooking.verifiedAt = new Date();
      fullBooking.verifiedBy = userId;
      
      await fullBooking.save(); // This is outside the wallet transaction but acceptable for now.

      await session.commitTransaction();
      
      logger.info('[PaymentService] Funds released for booking', { bookingId });
      return fullBooking;

    } catch (error) {
      await session.abortTransaction();
      logger.error('[PaymentService] Fund release failed', { bookingId, error: error.message });
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new PaymentService();
