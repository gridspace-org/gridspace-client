import Withdrawal from '../../../models/Withdrawal.model.js';
import AppError from '../../../utils/AppError.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import logger from '../../../config/logger.js';

export const approveWithdrawal = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { transactionReference, notes } = req.body;

  const withdrawal = await Withdrawal.findById(id);
  if (!withdrawal) return next(new AppError('Withdrawal not found', 404));

  if (withdrawal.status !== 'pending') {
    return next(new AppError('Withdrawal already processed', 400));
  }

  withdrawal.status = 'completed';
  withdrawal.processedBy = req.user._id;
  withdrawal.processedAt = new Date();
  withdrawal.transactionReference = transactionReference;
  withdrawal.notes = notes;
  await withdrawal.save();

  logger.info('[Admin] Withdrawal approved', {
    withdrawalId: id,
    amount: withdrawal.amount,
    userId: withdrawal.userId,
    processedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Withdrawal approved successfully',
    data: withdrawal
  });
});
