import { findUserBookings, findHostBookings } from '../../repositories/booking.repository.js';
import Space from '../../models/Space.model.js';
import logger from '../../config/logger.js';
import AppError from '../../utils/AppError.js';

const parsePaginationParams = ({ page = 1, limit = 10 }) => ({
  page: Number.parseInt(page, 10) || 1,
  limit: Number.parseInt(limit, 10) || 10,
});

export const getUserBookingsService = async ({ userId, status, page, limit }) => {
  const pagination = parsePaginationParams({ page, limit });

  logger.debug('BookingService.getUserBookings', {
    userId,
    status,
    ...pagination,
  });

  const result = await findUserBookings({
    userId,
    status,
    page: pagination.page,
    limit: pagination.limit,
  });

  const bookings = result.docs.map((booking) => ({
    _id: booking._id,
    space: {
      _id: booking.spaceId._id,
      title: booking.spaceId.title,
      location: booking.spaceId.location,
      images: booking.spaceId.images,
      amenities: booking.spaceId.amenities,
    },
    date: booking.formattedDate,
    time: booking.formattedTime,
    price: booking.totalAmount,
    guestCount: booking.guestCount,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    canReschedule: booking.canReschedule,
    canCancel: booking.canCancel,
  }));

  return {
    bookings,
    pagination: {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalBookings: result.totalDocs,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  };
};

export const getHostBookingsService = async ({ hostId, status, spaceId, page, limit }) => {
  const pagination = parsePaginationParams({ page, limit });

  logger.debug('BookingService.getHostBookings', {
    hostId,
    status,
    spaceId,
    ...pagination,
  });

  const hostSpaces = await Space.find({ hostId }).select('_id');
  const spaceIds = hostSpaces.map((space) => space._id.toString());

  if (spaceId && !spaceIds.includes(spaceId)) {
    throw new AppError('Access denied to space bookings', 403);
  }

  if (!spaceIds.length) {
    return {
      bookings: [],
      pagination: {
        currentPage: pagination.page,
        totalPages: 0,
        totalBookings: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  const result = await findHostBookings({
    hostId,
    status,
    spaceId,
    spaceIds,
    page: pagination.page,
    limit: pagination.limit,
  });

  const bookings = result.docs.map((booking) => ({
    _id: booking._id,
    user: {
      _id: booking.userId._id,
      fullname: booking.userId.fullname,
      email: booking.userId.email,
      profilePic: booking.userId.profilePic,
    },
    space: {
      _id: booking.spaceId._id,
      title: booking.spaceId.title,
      location: booking.spaceId.location,
    },
    date: booking.formattedDate,
    time: booking.formattedTime,
    guestCount: booking.guestCount,
    totalAmount: booking.totalAmount,
    hostEarnings: booking.hostEarnings,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    specialRequests: booking.specialRequests,
  }));

  return {
    bookings,
    pagination: {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalBookings: result.totalDocs,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  };
};
