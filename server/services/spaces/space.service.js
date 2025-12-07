import SpaceRepository from "../../repositories/space.repository.js";
import AppError from "../../utils/AppError.js";
import logger from "../../config/logger.js";
import { externalServices } from "../../libs/externalServices.js";

/**
 * Space Service Layer
 *
 * Handles all business logic for space operations.
 * Coordinates between controllers and repository layer.
 */

// Export the repository instance for use in other service methods
export { SpaceRepository };

/**
 * Create space service with image upload handling
 * @param {Object} spaceData - Space creation data
 * @param {Array} files - Uploaded image files
 * @returns {Promise<Object>} Created space
 */
export const createSpaceService = async (spaceData, files = []) => {
  logger.debug("SpaceService.createSpace", {
    hostId: spaceData.hostId,
    title: spaceData.title,
    imageCount: files.length,
  });

  try {
    // Validate required fields
    if (!spaceData.hostId) {
      throw new AppError("Host ID is required", 400);
    }

    if (!spaceData.title || !spaceData.description || !spaceData.location) {
      throw new AppError("Title, description, and location are required", 400);
    }

    if (!spaceData.pricePerHour || spaceData.pricePerHour <= 0) {
      throw new AppError("Valid price per hour is required", 400);
    }

    if (!spaceData.capacity || spaceData.capacity <= 0) {
      throw new AppError("Valid capacity is required", 400);
    }

    // Handle image uploads
    const imageUrls = await uploadSpaceImages(files);

    // Create space with validated data
    const validatedData = {
      title: spaceData.title.trim(),
      description: spaceData.description.trim(),
      location: spaceData.location.trim(),
      pricePerHour: parseFloat(spaceData.pricePerHour),
      capacity: parseInt(spaceData.capacity),
      purposes: Array.isArray(spaceData.purposes) ? spaceData.purposes : [],
      amenities: Array.isArray(spaceData.amenities) ? spaceData.amenities : [],
      rules: spaceData.rules || "",
      timeSlots: Array.isArray(spaceData.timeSlots) ? spaceData.timeSlots : [],
      hostId: spaceData.hostId,
      images: imageUrls,
      isActive: true,
    };

    const space = await SpaceRepository.create(validatedData);

    logger.info("Space created successfully", {
      spaceId: space._id,
      hostId: spaceData.hostId,
      title: space.title,
      imageCount: imageUrls.length,
    });

    return space;
  } catch (error) {
    logger.error("Failed to create space", {
      hostId: spaceData.hostId,
      title: spaceData.title,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to create space", 500);
  }
};

/**
 * Search spaces with filters and business logic
 * @param {Object} searchFilters - Search filters
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export const searchSpacesService = async (searchFilters = {}, options = {}) => {
  logger.debug("SpaceService.searchSpaces", {
    filters: searchFilters,
    options,
  });

  try {
    const { page = 1, limit = 10, sortBy = "newest" } = options;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      throw new AppError("Invalid pagination parameters", 400);
    }

    // Validate sort options
    const validSortOptions = [
      "newest",
      "price_low_high",
      "price_high_low",
      "rating",
      "most_popular",
    ];
    if (!validSortOptions.includes(sortBy)) {
      throw new AppError(
        `Invalid sort option. Must be one of: ${validSortOptions.join(", ")}`,
        400
      );
    }

    // Search spaces through repository
    const result = await SpaceRepository.searchSpaces(searchFilters, {
      page: pageNum,
      limit: limitNum,
      sortBy,
    });

    // Log search analytics (non-blocking)
    await logSearchAnalytics({
      searchFilters,
      resultsCount: result.totalDocs,
      hasResults: result.totalDocs > 0,
    });

    logger.info("Space search completed", {
      filterCount: Object.keys(searchFilters).length,
      resultsCount: result.totalDocs,
      page: pageNum,
      limit: limitNum,
    });

    return result;
  } catch (error) {
    logger.error("Failed to search spaces", {
      filters: searchFilters,
      options,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to search spaces", 500);
  }
};

/**
 * Get space by ID with validation
 * @param {string} spaceId - Space ID
 * @returns {Promise<Object>} Space details
 */
export const getSpaceByIdService = async (spaceId) => {
  logger.debug("SpaceService.getSpaceById", { spaceId });

  try {
    if (!spaceId) {
      throw new AppError("Space ID is required", 400);
    }

    const space = await SpaceRepository.findById(spaceId);

    if (!space || !space.isActive) {
      throw new AppError("Space not found or no longer available", 404);
    }

    logger.info("Space details retrieved", { spaceId });
    return space;
  } catch (error) {
    logger.error("Failed to get space by ID", {
      spaceId,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to retrieve space details", 500);
  }
};

/**
 * Update space with business logic
 * @param {string} spaceId - Space ID
 * @param {Object} updateData - Update data
 * @param {Array} files - New image files
 * @param {string} hostId - Host ID for validation
 * @returns {Promise<Object>} Updated space
 */
export const updateSpaceService = async (
  spaceId,
  updateData,
  files = [],
  hostId
) => {
  logger.debug("SpaceService.updateSpace", {
    spaceId,
    hostId,
    hasNewImages: files.length > 0,
  });

  try {
    if (!spaceId) {
      throw new AppError("Space ID is required", 400);
    }

    if (!hostId) {
      throw new AppError("Host ID is required", 400);
    }

    // Verify host owns the space
    const existingSpace = await SpaceRepository.findByIdForHost(
      spaceId,
      hostId
    );
    if (!existingSpace) {
      throw new AppError("Space not found or access denied", 404);
    }

    // Handle new image uploads if any
    let updatedImages = existingSpace.images || [];
    if (files.length > 0) {
      if (files.length > 5) {
        throw new AppError("Maximum 5 images allowed per space", 400);
      }

      const newImageUrls = await uploadSpaceImages(files);
      updatedImages = [...updatedImages, ...newImageUrls].slice(0, 5);
    }

    // Prepare update data
    const validatedData = {
      ...updateData,
      images: updatedImages,
    };

    // Update space
    const updatedSpace = await SpaceRepository.findByIdAndUpdate(
      spaceId,
      validatedData
    );

    logger.info("Space updated successfully", {
      spaceId,
      hostId,
      updatedFields: Object.keys(updateData),
      newImageCount: files.length,
    });

    return updatedSpace;
  } catch (error) {
    logger.error("Failed to update space", {
      spaceId,
      hostId,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to update space", 500);
  }
};

/**
 * Delete space with validation
 * @param {string} spaceId - Space ID
 * @param {string} hostId - Host ID for validation
 * @returns {Promise<Object>} Deletion result
 */
export const deleteSpaceService = async (spaceId, hostId) => {
  logger.debug("SpaceService.deleteSpace", { spaceId, hostId });

  try {
    if (!spaceId) {
      throw new AppError("Space ID is required", 400);
    }

    if (!hostId) {
      throw new AppError("Host ID is required", 400);
    }

    // Verify host owns the space
    const space = await SpaceRepository.findByIdForHost(spaceId, hostId);
    if (!space) {
      throw new AppError("Space not found or access denied", 404);
    }

    // Soft delete
    const deletedSpace = await SpaceRepository.findByIdAndSoftDelete(spaceId);

    logger.info("Space deleted successfully", {
      spaceId,
      hostId,
      spaceTitle: space.title,
    });

    return {
      spaceId,
      deletedAt: new Date(),
      message: "Space deleted successfully",
    };
  } catch (error) {
    logger.error("Failed to delete space", {
      spaceId,
      hostId,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to delete space", 500);
  }
};

/**
 * Get host spaces with business logic
 * @param {string} hostId - Host ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Host spaces
 */
export const getHostSpacesService = async (hostId, options = {}) => {
  logger.debug("SpaceService.getHostSpaces", { hostId, options });

  try {
    if (!hostId) {
      throw new AppError("Host ID is required", 400);
    }

    const { page = 1, limit = 10 } = options;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      throw new AppError("Invalid pagination parameters", 400);
    }

    const result = await SpaceRepository.findByHost(hostId, {
      page: pageNum,
      limit: limitNum,
    });

    logger.info("Host spaces retrieved", {
      hostId,
      spacesCount: result.totalDocs,
    });

    return result;
  } catch (error) {
    logger.error("Failed to get host spaces", {
      hostId,
      options,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to retrieve host spaces", 500);
  }
};

/**
 * Get space statistics
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Space statistics
 */
export const getSpaceStatisticsService = async (filters = {}) => {
  logger.debug("SpaceService.getSpaceStatistics", { filters });

  try {
    const stats = await SpaceRepository.getStatistics(filters);

    logger.info("Space statistics retrieved", {
      totalSpaces: stats.totalSpaces,
      filterCount: Object.keys(filters).length,
    });

    return stats;
  } catch (error) {
    logger.error("Failed to get space statistics", {
      filters,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to retrieve space statistics", 500);
  }
};

/**
 * Get popular spaces
 * @param {number} limit - Number of spaces to return
 * @returns {Promise<Array>} Popular spaces
 */
export const getPopularSpacesService = async (limit = 10) => {
  logger.debug("SpaceService.getPopularSpaces", { limit });

  try {
    const limitNum = parseInt(limit);
    if (limitNum < 1 || limitNum > 100) {
      throw new AppError("Invalid limit parameter", 400);
    }

    const spaces = await SpaceRepository.getPopular(limitNum);

    logger.info("Popular spaces retrieved", { count: spaces.length });
    return spaces;
  } catch (error) {
    logger.error("Failed to get popular spaces", {
      limit,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to retrieve popular spaces", 500);
  }
};

/**
 * Check space availability
 * @param {string} spaceId - Space ID
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {Promise<Object>} Availability result
 */
export const checkSpaceAvailabilityService = async (
  spaceId,
  startTime,
  endTime
) => {
  logger.debug("SpaceService.checkSpaceAvailability", {
    spaceId,
    startTime,
    endTime,
  });

  try {
    if (!spaceId || !startTime || !endTime) {
      throw new AppError(
        "Space ID, start time, and end time are required",
        400
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError("Invalid date format", 400);
    }

    if (start >= end) {
      throw new AppError("End time must be after start time", 400);
    }

    // Check if space exists and is active
    const space = await SpaceRepository.findById(spaceId);
    if (!space || !space.isActive) {
      throw new AppError("Space not found or no longer available", 404);
    }

    // Import BookingRepository for availability check
    const { BookingRepository } = await import(
      "../bookings/booking.service.js"
    );

    // Check for booking conflicts
    const conflicts = await BookingRepository.findConflicts(
      spaceId,
      start,
      end
    );

    const available = conflicts.length === 0;

    logger.info("Space availability checked", {
      spaceId,
      available,
      conflictCount: conflicts.length,
    });

    return {
      spaceId,
      available,
      timeSlot: { startTime: start, endTime: end },
      conflicts: conflicts.map((booking) => ({
        _id: booking._id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
      })),
    };
  } catch (error) {
    logger.error("Failed to check space availability", {
      spaceId,
      startTime,
      endTime,
      error: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to check space availability", 500);
  }
};

/**
 * Helper function to upload space images
 * @param {Array} files - Image files
 * @returns {Promise<Array>} Uploaded image URLs
 */
const uploadSpaceImages = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  const imageUrls = [];

  for (const file of files) {
    try {
      const uploadResult = await externalServices.cloudinary.upload(file.path, {
        folder: "workspace-spaces",
        quality: "auto:good",
        fetch_format: "auto",
        width: 1200,
        crop: "limit",
        resource_type: "image",
      });

      imageUrls.push(uploadResult.secure_url);
      logger.info("Space image uploaded successfully", {
        imageUrl: uploadResult.secure_url,
      });
    } catch (uploadError) {
      logger.error("Space image upload failed", {
        fileName: file.originalname,
        error: uploadError.message,
      });

      // Continue with other images even if one fails
      continue;
    }
  }

  return imageUrls;
};

/**
 * Helper function to log search analytics
 * @param {Object} analyticsData - Analytics data
 * @returns {Promise<void>}
 */
const logSearchAnalytics = async (analyticsData) => {
  try {
    const analyticsRecord = {
      searchQuery: analyticsData.searchFilters.location || "",
      filters: analyticsData.searchFilters,
      resultsCount: analyticsData.resultsCount,
      zeroResults: !analyticsData.hasResults,
      timestamp: new Date(),
    };

    await SpaceRepository.logSearchAnalytics(analyticsRecord);
  } catch (error) {
    // Don't throw error for analytics logging failures
    logger.error("Search analytics logging failed", {
      error: error.message,
    });
  }
};

/**
 * Validate space data
 * @param {Object} spaceData - Space data to validate
 * @returns {Object} Validation result
 */
export const validateSpaceData = (spaceData) => {
  const errors = [];

  if (!spaceData.title) {
    errors.push("Title is required");
  }

  if (!spaceData.description) {
    errors.push("Description is required");
  }

  if (!spaceData.location) {
    errors.push("Location is required");
  }

  if (!spaceData.pricePerHour || spaceData.pricePerHour <= 0) {
    errors.push("Valid price per hour is required");
  }

  if (!spaceData.capacity || spaceData.capacity <= 0) {
    errors.push("Valid capacity is required");
  }

  if (spaceData.purposes && !Array.isArray(spaceData.purposes)) {
    errors.push("Purposes must be an array");
  }

  if (spaceData.amenities && !Array.isArray(spaceData.amenities)) {
    errors.push("Amenities must be an array");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
