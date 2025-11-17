import Transaction from '../../models/Transaction.model.js';
import Booking from '../../models/Booking.model.js';
import monnifyService from '../../services/payment/monnify.service.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { paymentReference } = req.params;

  const transaction = await Transaction.findOne({ paymentReference });
  if (!transaction) return next(new AppError('Transaction not found', 404));

  if (transaction.userId.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  const verification = await monnifyService.verifyTransaction(paymentReference);

  transaction.status = verification.paymentStatus === 'PAID' ? 'paid' : 'failed';
  transaction.paymentMethod = verification.paymentMethod;
  transaction.paymentDate = verification.paidOn;
  transaction.verifiedAt = new Date();
  await transaction.save();

  if (transaction.status === 'paid') {
    const booking = await Booking.findById(transaction.bookingId);
    if (booking && booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'paid';
      booking.status = 'upcoming';
      booking.paidAt = new Date();
      await booking.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified',
    data: {
      paymentStatus: transaction.status,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      paidAt: transaction.paymentDate
    }
  });
});
