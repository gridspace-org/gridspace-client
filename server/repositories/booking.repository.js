import Booking from "../models/Booking.model.js";
import logger from "../config/logger.js";

class BookingRepository {
  async findByUserId(userId, filters = {}, options = {}) {
    const { status } = filters;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = -1,
      populateFields = ["spaceId"],
    } = options;

    const filter = { userId, isActive: true };
    if (status) {
      filter.status = status;
    }

    logger.debug("BookingRepository.findByUserId", {
      userId,
      userIdType: typeof userId,
      userIdString: userId.toString(),
      filter,
    });

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const query = Booking.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    // Apply population
    if (populateFields.includes("spaceId")) {
      query.populate(
        "spaceId",
        "title location images amenities capacity pricePerHour"
      );
    }

    const [bookings, total] = await Promise.all([
      query.lean(),
      Booking.countDocuments(filter),
    ]);
    logger.debug("BookingRepository.findByUserId result", {
      totalBookings: total,
      bookingsFound: bookings.length,
      firstBookingId: bookings.length > 0 ? bookings[0]._id : null,
    });

    return {
      bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findByHostId(hostId, filters = {}, options = {}) {
    const { status, spaceId } = filters;
    const {
      page = 1,
      limit = 10,
      sortBy = "startTime",
      sortOrder = -1,
      populateFields = ["userId", "spaceId"],
    } = options;

    // Build filter for host's spaces
    const filter = { isActive: true };

    if (status) {
      filter.status = status;
    }

    // If specific spaceId provided, filter by that space
    if (spaceId) {
      filter.spaceId = spaceId;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const query = Booking.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    // Apply population
    if (populateFields.includes("spaceId")) {
      query.populate("spaceId", "title location");
    }
    if (populateFields.includes("userId")) {
      query.populate("userId", "fullname email profilePic");
    }

    const [bookings, total] = await Promise.all([
      query.lean(),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(bookingId, populateFields = []) {
    let query = Booking.findById(bookingId);

    if (populateFields.length > 0) {
      populateFields.forEach((field) => {
        if (field === "spaceId") {
          query = query.populate(field, "hostId title");
        } else if (field === "userId") {
          query = query.populate(field, "fullname email profilePic");
        } else {
          query = query.populate(field);
        }
      });
    }

    return query.lean();
  }

  async findByIdAndUpdate(bookingId, updateData, populateFields = []) {
    let query = Booking.findByIdAndUpdate(bookingId, updateData, {
      new: true,
      runValidators: true,
    });

    if (populateFields.length > 0) {
      populateFields.forEach((field) => {
        if (field === "spaceId") {
          query = query.populate(field, "hostId title");
        } else if (field === "userId") {
          query = query.populate(field, "fullname email profilePic");
        } else {
          query = query.populate(field);
        }
      });
    }

    return query.lean();
  }

  async findConflicts(spaceId, startTime, endTime) {
    return Booking.find({
      spaceId,
      status: { $nin: ["cancelled"] },
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    }).lean();
  }

  async create(bookingData) {
    const booking = new Booking(bookingData);
    return booking.save();
  }

  async find(query = {}) {
    return Booking.find(query).lean();
  }

  async count(query = {}) {
    return Booking.countDocuments(query);
  }

  // Legacy methods for backward compatibility
  async findUserBookings({ userId, status, page, limit }) {
    return this.findByUserId(userId, { status }, { page, limit });
  }

  async findHostBookings({ hostId, spaceIds, spaceId, status, page, limit }) {
    return this.findByHostId(hostId, { spaceId, status }, { page, limit });
  }

  async findConflicts(spaceId, startTime, endTime) {
    return Booking.find({
      spaceId,
      status: { $nin: ["cancelled"] },
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    }).lean();
  }
}

export default BookingRepository;
