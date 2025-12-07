import Withdrawal from '../../../models/Withdrawal.model.js';
import walletService from '../../../services/wallet/wallet.service.js';
import AppError from '../../../utils/AppError.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import logger from '../../../config/logger.js';

export const rejectWithdrawal = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Rejection reason is required', 400));
  }

  const withdrawal = await Withdrawal.findById(id);
  if (!withdrawal) return next(new AppError('Withdrawal not found', 404));

  if (withdrawal.status !== 'pending') {
    return next(new AppError('Withdrawal already processed', 400));
  }

  // Refund to wallet
  await walletService.creditWallet(
    withdrawal.userId,
    withdrawal.amount,
    'refund',
    `Withdrawal rejected: ${reason}`
  );

  withdrawal.status = 'failed';
  withdrawal.processedBy = req.user._id;
  withdrawal.processedAt = new Date();
  withdrawal.failureReason = reason;
  await withdrawal.save();

  logger.info('[Admin] Withdrawal rejected', {
    withdrawalId: id,
    amount: withdrawal.amount,
    userId: withdrawal.userId,
    reason,
    processedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Withdrawal rejected, funds refunded to wallet',
    data: withdrawal
  });
});
