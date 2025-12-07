import Space from "../models/Space.model.js";
import SearchAnalytics from "../models/SearchAnalytics.model.js";
import AppError from "../utils/AppError.js";

/**
 * Space Repository Layer
 *
 * Handles all database operations for spaces following the Repository pattern.
 * Provides clean interface between service layer and MongoDB operations.
 */
class SpaceRepository {
  /**
   * Create a new space
   * @param {Object} spaceData - Space creation data
   * @returns {Promise<Object>} Created space
   */
  async create(spaceData) {
    try {
      const space = new Space(spaceData);
      return await space.save();
    } catch (error) {
      throw new AppError("Failed to create space", 500, {
        originalError: error.message,
      });
    }
  }

  /**
   * Find space by ID with host population
   * @param {string} id - Space ID
   * @returns {Promise<Object|null>} Space document
   */
  async findById(id) {
    try {
      return await Space.findById(id).populate(
        "hostId",
        "fullname profilePic emailVerified createdAt"
      );
    } catch (error) {
      throw new AppError("Failed to fetch space", 500, {
        originalError: error.message,
      });
    }
  }

  /**
   * Find space by ID with access validation
   * @param {string} id - Space ID
   * @param {string} hostId - Host ID for ownership validation
   * @returns {Promise<Object|null>} Space document
   */
  async findByIdForHost(id, hostId) {
    try {
      const space = await Space.findOne({ _id: id, hostId }).populate(
        "hostId",
        "fullname profilePic emailVerified"
      );

      if (!space) {
        throw new AppError("Space not found or access denied", 404);
      }

      return space;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to fetch space for host", 500, {
        originalError: error.message,
      });
    }
  }

  /**
   * Search spaces with filters and pagination
   * @param {Object} filters - Search filters
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchSpaces(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = "newest" } = options;

      // Build filter query
      const query = { isActive: true };

      if (filters.location) {
        query.location = { $regex: filters.location, $options: "i" };
      }

      if (filters.priceMin || filters.priceMax) {
        query.pricePerHour = {};
        if (filters.priceMin) query.pricePerHour.$gte = filters.priceMin;
        if (filters.priceMax) query.pricePerHour.$lte = filters.priceMax;
      }

      if (filters.capacity) {
        query.capacity = { $gte: filters.capacity };
      }

      if (filters.purposes && filters.purposes.length > 0) {
        query.purposes = { $in: filters.purposes };
      }

      if (filters.amenities && filters.amenities.length > 0) {
        query.amenities = { $all: filters.amenities };
      }

      // Build sort options
      let sortOptions = {};
      switch (sortBy) {
        case "price_low_high":
          sortOptions = { pricePerHour: 1 };
          break;
        case "price_high_low":
          sortOptions = { pricePerHour: -1 };
          break;
        case "rating":
          // Will need to join with reviews for average rating
          sortOptions = { createdAt: -1 };
          break;
        case "most_popular":
          // Will need booking count data
          sortOptions = { createdAt: -1 };
          break;
        default: // 'newest'
          sortOptions = { createdAt: -1 };
      }

      const searchOptions = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortOptions,
        populate: {
          path: "hostId",
          select: "fullname profilePic emailVerified",
        },
      };

      return await Space.paginate(query, searchOptions);
    } catch (error) {
      throw new AppError("Failed to search spaces", 500, {
        originalError: error.message,
      });
    }
  }

  /**
   * Get spaces for a specific host
   * @param {string} hostId - Host ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Host spaces with pagination
   */
  async findByHost(hostId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      const searchOptions = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: {
          path: "hostId",
          select: "fullname profilePic",
        },
      };

      return await Space.paginate({ hostId, isActive: true }, searchOptions);
    } catch (error) {
      throw new AppError("Failed to fetch host spaces", 500, {
        originalError: error.message,
      });
    }
  }

  /**
   * Update space
   * @param {string} id - Space ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated space
   */
  async findByIdAndUpdate(id, updateData) {
    try {
      return await Space.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate("hostId", "fullname profilePic emailVerified");
    } catch (error) {
      throw new AppError("Failed to update space", 500, {
        originalError: error.message,
      });
    }
  }

  /**
   * Soft delete space
   * @param {string} id - Space ID
   * @returns {Promise<Object>} Updated space
   */
  async findByIdAndSoftDelete(id) {
    try {
      return await Space.findByIdAndUpdate(
        id,
        {
          isActive: false,
          updatedAt: new Date(),
        },
        { new: true }
      );
    } catch (error) {
      throw new AppError("Failed to delete space", 500, {
        originalError: error.message,
      });
    }
  }

  /**
   * Get space statistics
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(filters = {}) {
    try {
      const pipeline = [
        { $match: { isActive: true, ...filters } },
        {
          $group: {
            _id: null,
            totalSpaces: { $sum: 1 },
            avgPricePerHour: { $avg: "$pricePerHour" },
            minPricePerHour: { $min: "$pricePerHour" },
            maxPricePerHour: { $max: "$pricePerHour" },
            totalCapacity: { $sum: "$capacity" },
          },
        },
      ];

      const result = await Space.aggregate(pipeline);
      return (
        result[0] || {
          totalSpaces: 0,
          avgPricePerHour: 0,
          minPricePerHour: 0,
          maxPricePerHour: 0,
          totalCapacity: 0,
        }
      );
    } catch (error) {
      throw new AppError("Failed to get space statistics", 500, {
        originalError: error.message,
      });
    }
  }

  /**
   * Find nearby spaces
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Radius in kilometers
   * @returns {Promise<Array>} Nearby spaces
   */
  async findNearby(lat, lng, radius = 10) {
    try {
      // This would require a geospatial index on the location field
      // For now, return empty array as location structure needs to be defined
      return [];
    } catch (error) {
      throw new AppError("Failed to find nearby spaces", 500, {
        originalError: error.message,
      });
    }
  }

  /**
   * Log search analytics
   * @param {Object} analyticsData - Analytics data
   * @returns {Promise<Object>} Created analytics record
   */
  async logSearchAnalytics(analyticsData) {
    try {
      const analytics = new SearchAnalytics(analyticsData);
      return await analytics.save();
    } catch (error) {
      // Don't throw error for analytics logging failures
      console.error("Search analytics logging failed:", error.message);
      return null;
    }
  }

  /**
   * Check if space exists and is active
   * @param {string} id - Space ID
   * @returns {Promise<boolean>} Whether space exists and is active
   */
  async isActive(id) {
    try {
      const space = await Space.findOne({ _id: id, isActive: true }).lean();
      return !!space;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get popular spaces (most booked)
   * @param {number} limit - Number of spaces to return
   * @returns {Promise<Array>} Popular spaces
   */
  async getPopular(limit = 10) {
    try {
      // This would require joining with bookings collection
      // For now, return newest spaces
      return await Space.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("hostId", "fullname profilePic emailVerified")
        .lean();
    } catch (error) {
      throw new AppError("Failed to get popular spaces", 500, {
        originalError: error.message,
      });
    }
  }

  /**
   * Update space rating (when reviews are implemented)
   * @param {string} id - Space ID
   * @param {number} newRating - New rating
   * @returns {Promise<Object>} Updated space
   */
  async updateRating(id, newRating) {
    try {
      // This would require a more complex calculation with review aggregation
      // For now, just update the rating field directly
      return await Space.findByIdAndUpdate(
        id,
        {
          rating: newRating,
          updatedAt: new Date(),
        },
        { new: true }
      );
    } catch (error) {
      throw new AppError("Failed to update space rating", 500, {
        originalError: error.message,
      });
    }
  }
}

// Export the repository instance
export { SpaceRepository };
export default new SpaceRepository();
