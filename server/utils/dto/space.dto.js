/**
 * Space DTO (Data Transfer Object) Formatters
 *
 * Standardizes response formatting for all space-related endpoints.
 * Ensures consistent API responses across the application.
 */

import AppError from "../../utils/AppError.js";

/**
 * Format individual space response
 * @param {Object} space - Space document
 * @returns {Object} Formatted space response
 */
export const formatSpaceResponse = (space) => {
  if (!space) {
    throw new AppError("Space data is required", 400);
  }

  return {
    _id: space._id,
    title: space.title,
    description: space.description,
    location: space.location,
    pricePerHour: space.pricePerHour,
    capacity: space.capacity,
    purposes: space.purposes || [],
    amenities: space.amenities || [],
    timeSlots: space.timeSlots || [],
    images: space.images || [],
    host: space.hostId
      ? {
          _id: space.hostId._id,
          fullname: space.hostId.fullname,
          profilePic: space.hostId.profilePic,
          emailVerified: space.hostId.emailVerified,
        }
      : null,
    rating: space.rating || 0,
    isActive: space.isActive,
    createdAt: space.createdAt,
    updatedAt: space.updatedAt,
  };
};

/**
 * Format spaces list response
 * @param {Array} spaces - Array of spaces
 * @param {Object} pagination - Pagination information
 * @returns {Object} Formatted spaces list response
 */
export const formatSpacesListResponse = (spaces, pagination) => {
  return {
    success: true,
    message: "Spaces retrieved successfully",
    data: {
      spaces: spaces.map((space) => formatSpaceResponse(space)),
      pagination: {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalSpaces: pagination.totalSpaces,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
      },
    },
  };
};

/**
 * Format space creation response
 * @param {Object} space - Created space
 * @returns {Object} Formatted creation response
 */
export const formatSpaceCreationResponse = (space) => {
  return {
    success: true,
    message: "Space created successfully",
    data: formatSpaceResponse(space),
  };
};

/**
 * Format space update response
 * @param {Object} space - Updated space
 * @returns {Object} Formatted update response
 */
export const formatSpaceUpdateResponse = (space) => {
  return {
    success: true,
    message: "Space updated successfully",
    data: formatSpaceResponse(space),
  };
};

/**
 * Format space deletion response
 * @param {string} spaceId - Deleted space ID
 * @returns {Object} Formatted deletion response
 */
export const formatSpaceDeletionResponse = (spaceId) => {
  return {
    success: true,
    message: "Space deleted successfully",
    data: {
      spaceId,
      deletedAt: new Date().toISOString(),
    },
  };
};

/**
 * Format host spaces response
 * @param {Array} spaces - Host's spaces
 * @param {Object} pagination - Pagination information
 * @returns {Object} Formatted host spaces response
 */
export const formatHostSpacesResponse = (spaces, pagination) => {
  return {
    success: true,
    message: "Your spaces retrieved successfully",
    data: {
      spaces: spaces.map((space) => formatSpaceResponse(space)),
      pagination: {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalSpaces: pagination.totalSpaces,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
      },
    },
  };
};

/**
 * Format search results response
 * @param {Array} spaces - Search results
 * @param {Object} pagination - Pagination information
 * @param {Object} searchFilters - Applied search filters
 * @returns {Object} Formatted search response
 */
export const formatSpaceSearchResponse = (
  spaces,
  pagination,
  searchFilters = {}
) => {
  return {
    success: true,
    message: "Spaces retrieved successfully",
    data: {
      spaces: spaces.map((space) => formatSpaceResponse(space)),
      pagination: {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalSpaces: pagination.totalSpaces,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
      },
      filters: searchFilters,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Format space statistics response
 * @param {Object} stats - Space statistics
 * @returns {Object} Formatted statistics response
 */
export const formatSpaceStatisticsResponse = (stats) => {
  return {
    success: true,
    message: "Space statistics retrieved successfully",
    data: {
      statistics: {
        totalSpaces: stats.totalSpaces || 0,
        avgPricePerHour: stats.avgPricePerHour || 0,
        minPricePerHour: stats.minPricePerHour || 0,
        maxPricePerHour: stats.maxPricePerHour || 0,
        totalCapacity: stats.totalCapacity || 0,
      },
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Format popular spaces response
 * @param {Array} spaces - Popular spaces
 * @returns {Object} Formatted popular spaces response
 */
export const formatPopularSpacesResponse = (spaces) => {
  return {
    success: true,
    message: "Popular spaces retrieved successfully",
    data: {
      spaces: spaces.map((space) => formatSpaceResponse(space)),
      count: spaces.length,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Format nearby spaces response
 * @param {Array} spaces - Nearby spaces
 * @param {Object} location - Search location
 * @param {number} radius - Search radius
 * @returns {Object} Formatted nearby spaces response
 */
export const formatNearbySpacesResponse = (spaces, location, radius) => {
  return {
    success: true,
    message: "Nearby spaces retrieved successfully",
    data: {
      spaces: spaces.map((space) => formatSpaceResponse(space)),
      searchCriteria: {
        location,
        radius,
        count: spaces.length,
      },
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Format space availability response
 * @param {Object} availability - Availability information
 * @returns {Object} Formatted availability response
 */
export const formatSpaceAvailabilityResponse = (availability) => {
  return {
    success: true,
    message: "Space availability retrieved successfully",
    data: {
      spaceId: availability.spaceId,
      available: availability.available,
      timeSlot: availability.timeSlot,
      conflicts: availability.conflicts || [],
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Format space validation error response
 * @param {Array|string} errors - Validation errors
 * @returns {Object} Formatted validation error response
 */
export const formatSpaceValidationError = (errors) => {
  const errorMessages = Array.isArray(errors) ? errors : [errors];

  return {
    success: false,
    message: "Validation failed",
    errors: errorMessages.map((error) => ({
      field: error.field || "general",
      message: error.message || error,
    })),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Format space error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @returns {Object} Formatted error response
 */
export const formatSpaceErrorResponse = (message, code = "SPACE_ERROR") => {
  return {
    success: false,
    message,
    error: {
      code,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Format image upload response
 * @param {Array} imageUrls - Uploaded image URLs
 * @returns {Object} Formatted image upload response
 */
export const formatImageUploadResponse = (imageUrls) => {
  return {
    success: true,
    message: "Images uploaded successfully",
    data: {
      images: imageUrls,
      count: imageUrls.length,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Format space comparison response
 * @param {Array} spaces - Spaces to compare
 * @param {Array} comparisonFields - Fields to compare
 * @returns {Object} Formatted comparison response
 */
export const formatSpaceComparisonResponse = (
  spaces,
  comparisonFields = []
) => {
  return {
    success: true,
    message: "Spaces compared successfully",
    data: {
      spaces: spaces.map((space) => formatSpaceResponse(space)),
      comparison: {
        fields: comparisonFields,
        count: spaces.length,
      },
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Helper function to validate and format space data
 * @param {Object} spaceData - Raw space data
 * @returns {Object} Validated and formatted space data
 */
export const validateAndFormatSpaceData = (spaceData) => {
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

  if (errors.length > 0) {
    throw new AppError(`Validation failed: ${errors.join(", ")}`, 400);
  }

  return {
    title: spaceData.title.trim(),
    description: spaceData.description.trim(),
    location: spaceData.location.trim(),
    pricePerHour: parseFloat(spaceData.pricePerHour),
    capacity: parseInt(spaceData.capacity),
    purposes: Array.isArray(spaceData.purposes) ? spaceData.purposes : [],
    amenities: Array.isArray(spaceData.amenities) ? spaceData.amenities : [],
    images: Array.isArray(spaceData.images) ? spaceData.images : [],
    rules: spaceData.rules || "",
    hostId: spaceData.hostId,
    isActive: true,
  };
};
