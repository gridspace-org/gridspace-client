import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import bookingService from '../../services/bookings/booking.service.js';

/**
 * @desc    Get booking by ID
 * @route   GET /api/v1/bookings/:id
 * @access  Private (User must own booking or be host of space)
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const booking = await bookingService.getBookingById(id, userId, userRole);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Booking retrieved successfully',
    data: { booking }
  });
});