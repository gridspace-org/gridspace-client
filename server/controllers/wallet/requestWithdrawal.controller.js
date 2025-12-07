import mongoose from 'mongoose';
import Wallet from '../../models/Wallet.model.js';
import Withdrawal from '../../models/Withdrawal.model.js';
import WalletTransaction from '../../models/WalletTransaction.model.js';
import walletService from '../../services/wallet/wallet.service.js';
import env from '../../config/env.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const requestWithdrawal = asyncHandler(async (req, res, next) => {
  const { amount, accountNumber, accountName, bankName, bankCode } = req.body;
  const userId = req.user._id;

  if (amount < env.wallet.minWithdrawal) {
    return next(new AppError(`Minimum withdrawal is ₦${env.wallet.minWithdrawal}`, 400));
  }

  // CRITICAL FIX #3: Check daily/monthly withdrawal limits with aggregation
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [dailyTotal, monthlyTotal, wallet] = await Promise.all([
    // Daily withdrawals
    Withdrawal.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: { $in: ['pending', 'processing', 'completed'] },
          createdAt: { $gte: startOfDay }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    // Monthly withdrawals
    Withdrawal.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: { $in: ['pending', 'processing', 'completed'] },
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    // Get wallet
    walletService.getWallet(userId)
  ]);

  const dailyWithdrawn = dailyTotal[0]?.total || 0;
  const monthlyWithdrawn = monthlyTotal[0]?.total || 0;

  // Check limits
  if (dailyWithdrawn + amount > wallet.dailyWithdrawalLimit) {
    return next(new AppError(
      `Daily withdrawal limit exceeded. Limit: ₦${wallet.dailyWithdrawalLimit}, Used: ₦${dailyWithdrawn}`,
      400
    ));
  }

  if (monthlyWithdrawn + amount > wallet.monthlyWithdrawalLimit) {
    return next(new AppError(
      `Monthly withdrawal limit exceeded. Limit: ₦${wallet.monthlyWithdrawalLimit}, Used: ₦${monthlyWithdrawn}`,
      400
    ));
  }

  // CRITICAL FIX #2: Atomic balance check and debit (prevents race condition)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Atomic operation: check balance and debit in one query
    const updatedWallet = await Wallet.findOneAndUpdate(
      {
        userId,
        availableBalance: { $gte: amount } // Only update if balance sufficient
      },
      {
        $inc: { availableBalance: -amount }
      },
      { new: true, session }
    );

    if (!updatedWallet) {
      throw new AppError('Insufficient balance', 400);
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create([{
      userId,
      walletId: wallet._id,
      amount,
      bankAccount: { accountNumber, accountName, bankName, bankCode },
      reference: `WD-${Date.now()}-${userId}`,
      status: 'pending'
    }], { session });

    // Create wallet transaction record
    await WalletTransaction.create([{
      walletId: wallet._id,
      userId,
      type: 'debit',
      category: 'withdrawal',
      amount,
      balanceBefore: updatedWallet.availableBalance + amount,
      balanceAfter: updatedWallet.availableBalance,
      status: 'completed',
      reference: `WTX-${Date.now()}-${userId}`,
      description: `Withdrawal to ${bankName} - ${accountNumber}`
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        reference: withdrawal[0].reference,
        amount: withdrawal[0].amount,
        status: withdrawal[0].status,
        bankAccount: withdrawal[0].bankAccount
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
