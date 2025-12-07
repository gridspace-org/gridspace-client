import paymentService from '../../services/payment/payment.service.js';
import Booking from '../../models/Booking.model.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const verifyBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError('Booking not found', 404));

  // Only the user who booked can verify
  if (booking.userId.toString() !== userId.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  // Can only verify if paid and not already verified
  if (booking.paymentStatus !== 'paid') {
    return next(new AppError('Booking is not paid', 400));
  }
  if (booking.fundsReleased) {
    return next(new AppError('Booking already verified', 400));
  }

  // Release funds
  const updatedBooking = await paymentService.releaseBookingFunds(bookingId, userId);

  res.status(200).json({
    success: true,
    message: 'Booking verified and funds released to host',
    data: updatedBooking
  });
});
