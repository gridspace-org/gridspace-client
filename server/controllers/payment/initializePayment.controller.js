import Transaction from '../../models/Transaction.model.js';
import Booking from '../../models/Booking.model.js';
import monnifyService from '../../services/payment/monnify.service.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import env from '../../config/env.js';

export const initializePayment = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.body;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId).populate('spaceId');
  
  if (!booking) return next(new AppError('Booking not found', 404));
  if (booking.userId.toString() !== userId.toString()) {
    return next(new AppError('Unauthorized', 403));
  }
  if (booking.paymentStatus === 'paid') {
    return next(new AppError('Booking already paid', 400));
  }
  if (booking.status !== 'pending') {
    return next(new AppError('Booking is not pending payment', 400));
  }

  const paymentReference = `GS-${Date.now()}-${bookingId}`;

  const monnifyResponse = await monnifyService.initializeTransaction({
    amount: booking.totalAmount,
    customerEmail: req.user.email,
    customerName: req.user.fullname,
    paymentReference,
    paymentDescription: `Booking for ${booking.spaceId.title}`,
    redirectUrl: `${env.frontendUrl}/bookings/${bookingId}/payment-complete`
  });

  await Transaction.create({
    bookingId,
    userId,
    paymentReference,
    transactionReference: monnifyResponse.transactionReference,
    amount: booking.totalAmount,
    checkoutUrl: monnifyResponse.checkoutUrl,
    customerEmail: req.user.email,
    customerName: req.user.fullname
  });

  booking.paymentReference = paymentReference;
  booking.transactionReference = monnifyResponse.transactionReference;
  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Payment initialized successfully',
    data: {
      checkoutUrl: monnifyResponse.checkoutUrl,
      paymentReference,
      transactionReference: monnifyResponse.transactionReference,
      amount: booking.totalAmount
    }
  });
});
