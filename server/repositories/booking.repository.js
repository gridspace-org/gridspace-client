import Booking from '../models/Booking.model.js';

export const findUserBookings = async ({ userId, status, page, limit }) => {
  const filter = { userId, isActive: true };
  if (status) {
    filter.status = status;
  }

  const options = {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: {
      path: 'spaceId',
      select: 'title location images amenities capacity pricePerHour',
    },
    lean: true,
  };

  return Booking.paginate(filter, options);
};

export const findBookingByIdWithSpace = (bookingId) =>
  Booking.findById(bookingId).populate('spaceId', 'hostId title');

export const findActiveBookingForUser = ({ bookingId, userId }) =>
  Booking.findOne({ _id: bookingId, userId, isActive: true });

export const updateBookingById = (bookingId, update, { runValidators = true, populate } = {}) => {
  let query = Booking.findByIdAndUpdate(
    bookingId,
    update,
    { new: true, runValidators }
  );

  if (populate) {
    const populations = Array.isArray(populate) ? populate : [populate];
    populations.forEach((pop) => {
      query = query.populate(pop);
    });
  }

  return query;
};

export const findHostBookings = async ({ hostId, spaceIds, spaceId, status, page, limit }) => {
  const filter = {
    spaceId: spaceId || { $in: spaceIds },
    isActive: true,
  };

  if (status) {
    filter.status = status;
  }

  const options = {
    page,
    limit,
    sort: { startTime: 1 },
    populate: [
      {
        path: 'spaceId',
        select: 'title location',
      },
      {
        path: 'userId',
        select: 'fullname email profilePic',
      },
    ],
    lean: true,
  };

  return Booking.paginate(filter, options);
};
