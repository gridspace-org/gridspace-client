import Wallet from "../../models/Wallet.model.js";
import WalletTransaction from "../../models/WalletTransaction.model.js";
import AppError from "../../utils/AppError.js";
import logger from "../../config/logger.js";
import { getPaginationParams } from "../../utils/pagination.js";

import monnifyService from "../../services/payment/monnify.service.js";
import paymentService from "../../services/payment/payment.service.js";
import env from "../../config/env.js";
import Booking from "../../models/Booking.model.js";
import Transaction from "../../models/Transaction.model.js";

class WalletService {
  async createWallet(userId) {
    try {
      const wallet = await Wallet.create({ userId });
      logger.info("[Wallet] Created", { userId, walletId: wallet._id });
      return wallet;
    } catch (error) {
      logger.error("[Wallet] Creation failed", {
        userId,
        error: error.message,
      });
      throw new AppError("Failed to create wallet", 500);
    }
  }

  async getWallet(userId) {
    const wallet = await Wallet.findOne({ userId, isActive: true });
    if (!wallet) throw new AppError("Wallet not found", 404);
    return wallet;
  }

  async creditWallet(userId, amount, category, description, metadata = {}) {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) throw new AppError("Wallet not found", 404);

      const balanceBefore = wallet.availableBalance;
      wallet.availableBalance += amount;
      await wallet.save({ session });

      const reference = `WTX-${Date.now()}-${userId}`;
      await WalletTransaction.create(
        [
          {
            walletId: wallet._id,
            userId,
            type: "credit",
            category,
            amount,
            balanceBefore,
            balanceAfter: wallet.availableBalance,
            status: "completed",
            reference,
            description,
            ...metadata,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      logger.info("[Wallet] Credited", { userId, amount, category });
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      logger.error("[Wallet] Credit failed", { userId, error: error.message });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async debitWallet(userId, amount, category, description, metadata = {}) {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) throw new AppError("Wallet not found", 404);
      if (wallet.availableBalance < amount) {
        throw new AppError("Insufficient balance", 400);
      }

      const balanceBefore = wallet.availableBalance;
      wallet.availableBalance -= amount;
      await wallet.save({ session });

      const reference = `WTX-${Date.now()}-${userId}`;
      await WalletTransaction.create(
        [
          {
            walletId: wallet._id,
            userId,
            type: "debit",
            category,
            amount,
            balanceBefore,
            balanceAfter: wallet.availableBalance,
            status: "completed",
            reference,
            description,
            ...metadata,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      logger.info("[Wallet] Debited", { userId, amount, category });
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      logger.error("[Wallet] Debit failed", { userId, error: error.message });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addPendingBalance(
    userId,
    amount,
    category,
    description,
    metadata = {}
  ) {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) throw new AppError("Wallet not found", 404);

      const balanceBefore = wallet.pendingBalance;
      wallet.pendingBalance += amount;
      await wallet.save({ session });

      const reference = `WTX-${Date.now()}-${userId}`;
      await WalletTransaction.create(
        [
          {
            walletId: wallet._id,
            userId,
            type: "credit",
            category,
            amount,
            balanceBefore,
            balanceAfter: wallet.pendingBalance,
            status: "pending",
            reference,
            description,
            ...metadata,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      logger.info("[Wallet] Pending balance added", {
        userId,
        amount,
        category,
      });
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      logger.error("[Wallet] Add pending failed", {
        userId,
        error: error.message,
      });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async releasePendingBalance(userId, amount) {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) throw new AppError("Wallet not found", 404);
      if (wallet.pendingBalance < amount) {
        throw new AppError("Insufficient pending balance", 400);
      }

      wallet.pendingBalance -= amount;
      wallet.availableBalance += amount;
      await wallet.save({ session });

      await session.commitTransaction();
      logger.info("[Wallet] Pending balance released", { userId, amount });
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      logger.error("[Wallet] Release pending failed", {
        userId,
        error: error.message,
      });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getTransactions(userId, options = {}) {
    // Enforce max limit to prevent abuse
    const { page, limit } = getPaginationParams(options, 20, 50);
    const { category, status } = options;

    const query = { userId };
    if (category) query.category = category;
    if (status) query.status = status;

    const transactions = await WalletTransaction.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: "bookingId",
        select: "spaceId startTime endTime totalAmount",
      },
    });

    return transactions;
  }

  async initiateDeposit(userId, amount, description) {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
      const user = await Wallet.findOne({ userId }).session(session); // Verify wallet exists
      if (!user) throw new AppError("Wallet not found", 404);

      const paymentReference = `DEP-${Date.now()}-${userId}`;
      const finalDescription = description || "Wallet Deposit";

      // Create pending transaction
      await WalletTransaction.create(
        [
          {
            walletId: user._id,
            userId,
            type: "credit",
            category: "deposit",
            amount,
            balanceBefore: user.availableBalance,
            balanceAfter: user.availableBalance, // No change yet
            status: "pending",
            reference: paymentReference,
            description: finalDescription,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Initialize with Monnify (outside transaction to avoid long-running db transaction)
      // We need user details, but for now we'll pass minimal info or fetch user if needed.
      // Ideally, the controller passes user details. Let's assume we fetch user here or pass it.
      // For better design, let's fetch user email/name in controller and pass it,
      // OR fetch it here. Let's fetch it here for safety.
      const User = (await import("../../models/User.model.js")).default;
      const userDetails = await User.findById(userId).select("email fullname");

      let monnifyResponse;
      try {
        monnifyResponse = await monnifyService.initializeTransaction({
          amount,
          customerName: userDetails.fullname,
          customerEmail: userDetails.email,
          paymentReference,
          paymentDescription: finalDescription,
          redirectUrl: `${env.frontendUrl}/wallet/deposit-complete`,
          metadata: { type: "wallet_deposit", userId },
        });
      } catch (error) {
        if (error.code === "MONNIFY_UNAVAILABLE") {
          throw new AppError(
            "Payment service temporarily unavailable. Please try again in a few minutes.",
            503
          );
        }
        throw error;
      }

      return {
        checkoutUrl: monnifyResponse.checkoutUrl,
        paymentReference,
        transactionReference: monnifyResponse.transactionReference,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error("[Wallet] Deposit initiation failed", {
        userId,
        error: error.message,
      });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async processBookingPayment(userId, bookingId) {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findById(bookingId)
        .populate("spaceId")
        .session(session);

      if (!booking) throw new AppError("Booking not found", 404);
      if (booking.paymentStatus === "paid")
        throw new AppError("Booking already paid", 400);

      // Debit User Wallet
      await this.debitWallet(
        userId,
        booking.totalAmount,
        "booking_payment",
        `Payment for booking ${booking._id}`,
        { bookingId: booking._id }
      );

      // Update Booking Status
      booking.paymentStatus = "paid";
      booking.status = "upcoming";
      booking.paidAt = new Date();
      await booking.save({ session });

      // Create Transaction Record (for consistency with Monnify flow)
      await Transaction.create(
        [
          {
            userId,
            bookingId,
            amount: booking.totalAmount,
            currency: "NGN",
            paymentStatus: "paid",
            paymentMethod: "wallet",
            paymentReference: `WAL-${Date.now()}-${booking._id}`,
            transactionReference: `WTX-${Date.now()}-${booking._id}`,
            paymentDate: new Date(),
            webhookReceived: true, // Internal transaction, treated as verified
          },
        ],
        { session }
      );

      // Distribute Funds (Host & Admin)
      await paymentService.distributeBookingFunds(booking, session);

      await session.commitTransaction();
      logger.info("[Wallet] Booking paid via wallet", { userId, bookingId });

      return booking;
    } catch (error) {
      await session.abortTransaction();
      logger.error("[Wallet] Booking payment failed", {
        userId,
        bookingId,
        error: error.message,
      });
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new WalletService();
