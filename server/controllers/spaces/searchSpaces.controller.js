import { 
  searchSpacesService, 
  getPopularSpacesService,
  getSpaceStatisticsService,
  checkSpaceAvailabilityService 
} from '../../services/spaces/space.service.js';
import { 
  formatSpaceSearchResponse, 
  formatPopularSpacesResponse,
  formatSpaceStatisticsResponse,
  formatSpaceAvailabilityResponse,
  formatSpaceErrorResponse, 
  formatSpaceValidationError
} from '../../utils/dto/space.dto.js';
import logger from '../../config/logger.js';

/**
 * Search Spaces Controller
 * 
 * Handles GET /api/v1/spaces
 * Advanced space search with filtering and pagination
 */
export const searchSpaces = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info('SearchSpaces request started', {
      query: req.query,
      userId: req.user?._id
    });

    // Extract search parameters
    const {
      location,
      priceMin,
      priceMax,
      capacity,
      purposes,
      amenities,
      page = 1,
      limit = 10,
      sortBy = 'newest'
    } = req.query;

    // Parse arrays from query parameters
    const purposesList = purposes ? purposes.split(',') : [];
    const amenitiesList = amenities ? amenities.split(',') : [];

    // Build search filters
    const searchFilters = {};
    
    if (location) {
      searchFilters.location = location;
    }
    
    if (priceMin) {
      const minPrice = parseFloat(priceMin);
      if (isNaN(minPrice) || minPrice < 0) {
        return res.status(400).json(
          formatSpaceValidationError('Invalid minimum price')
        );
      }
      searchFilters.priceMin = minPrice;
    }
    
    if (priceMax) {
      const maxPrice = parseFloat(priceMax);
      if (isNaN(maxPrice) || maxPrice < 0) {
        return res.status(400).json(
          formatSpaceValidationError('Invalid maximum price')
        );
      }
      searchFilters.priceMax = maxPrice;
    }
    
    if (capacity) {
      const minCapacity = parseInt(capacity);
      if (isNaN(minCapacity) || minCapacity < 1) {
        return res.status(400).json(
          formatSpaceValidationError('Invalid minimum capacity')
        );
      }
      searchFilters.capacity = minCapacity;
    }
    
    if (purposesList.length > 0) {
      searchFilters.purposes = purposesList;
    }
    
    if (amenitiesList.length > 0) {
      searchFilters.amenities = amenitiesList;
    }

    // Search spaces through service layer
    const result = await searchSpacesService(searchFilters, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    });

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Space search completed successfully', {
      filterCount: Object.keys(searchFilters).length,
      resultsCount: result.totalDocs,
      page: result.page,
      limit: result.limit,
      responseTime: `${responseTime}ms`
    });

    // Format and send response using DTO
    const response = formatSpaceSearchResponse(
      result.docs,
      result,
      searchFilters
    );
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to search spaces', {
      query: req.query,
      userId: req.user?._id,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    // Handle specific error types
    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatSpaceErrorResponse(error.message, error.code)
      );
    }

    // Default server error
    res.status(500).json(
      formatSpaceErrorResponse('Internal server error while searching spaces')
    );
  }
};

/**
 * Get Popular Spaces
 * 
 * Handles GET /api/v1/spaces/popular
 * Returns popular spaces based on various criteria
 */
export const getPopularSpaces = async (req, res) => {
  const startTime = Date.now();
  const { limit = 10 } = req.query;

  try {
    logger.info('GetPopularSpaces request started', {
      limit: parseInt(limit),
      userId: req.user?._id
    });

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json(
        formatSpaceValidationError('Limit must be between 1 and 100')
      );
    }

    // Get popular spaces through service layer
    const spaces = await getPopularSpacesService(limitNum);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Popular spaces retrieved successfully', {
      count: spaces.length,
      responseTime: `${responseTime}ms`
    });

    // Format response
    const response = formatPopularSpacesResponse(spaces);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to get popular spaces', {
      limit,
      userId: req.user?._id,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatSpaceErrorResponse(error.message, error.code)
      );
    }

    res.status(500).json(
      formatSpaceErrorResponse('Internal server error while retrieving popular spaces')
    );
  }
};

/**
 * Get Space Statistics
 * 
 * Handles GET /api/v1/spaces/statistics
 * Returns aggregated statistics about spaces
 */
export const getSpaceStatistics = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info('GetSpaceStatistics request started', {
      query: req.query,
      userId: req.user?._id
    });

    // Build filters from query parameters (optional)
    const filters = {};
    
    if (req.query.location) {
      filters.location = req.query.location;
    }
    
    if (req.query.priceRange) {
      // Parse price range (e.g., "1000-5000")
      const [min, max] = req.query.priceRange.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        filters.priceRange = { min, max };
      }
    }

    // Get statistics through service layer
    const stats = await getSpaceStatisticsService(filters);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Space statistics retrieved successfully', {
      filterCount: Object.keys(filters).length,
      responseTime: `${responseTime}ms`
    });

    // Format response
    const response = formatSpaceStatisticsResponse(stats);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to get space statistics', {
      query: req.query,
      userId: req.user?._id,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatSpaceErrorResponse(error.message, error.code)
      );
    }

    res.status(500).json(
      formatSpaceErrorResponse('Internal server error while retrieving space statistics')
    );
  }
};

/**
 * Check Space Availability
 * 
 * Handles POST /api/v1/spaces/check-availability
 * Checks if a space is available for a specific time period
 */
export const checkSpaceAvailability = async (req, res) => {
  const startTime = Date.now();
  const { spaceId, startTime: checkStartTime, endTime: checkEndTime } = req.body;

  try {
    logger.info('CheckSpaceAvailability request started', {
      spaceId,
      startTime: checkStartTime,
      endTime: checkEndTime,
      userId: req.user?._id
    });

    // Validate required fields
    if (!spaceId || !checkStartTime || !checkEndTime) {
      return res.status(400).json(
        formatSpaceValidationError('Space ID, start time, and end time are required')
      );
    }

    // Check availability through service layer
    const availability = await checkSpaceAvailabilityService(
      spaceId,
      checkStartTime,
      checkEndTime
    );

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Space availability checked', {
      spaceId,
      available: availability.available,
      conflictCount: availability.conflicts?.length || 0,
      responseTime: `${responseTime}ms`
    });

    // Format response
    const response = formatSpaceAvailabilityResponse(availability);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to check space availability', {
      spaceId,
      startTime: checkStartTime,
      endTime: checkEndTime,
      userId: req.user?._id,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatSpaceErrorResponse(error.message, error.code)
      );
    }

    res.status(500).json(
      formatSpaceErrorResponse('Internal server error while checking space availability')
    );
  }
};

/**
 * Advanced Space Search
 * 
 * Handles POST /api/v1/spaces/advanced-search
 * More complex search with additional filters and options
 */
export const advancedSpaceSearch = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info('AdvancedSpaceSearch request started', {
      body: req.body,
      userId: req.user?._id
    });

    // Extract advanced search parameters
    const {
      location,
      priceRange,
      capacity,
      purposes,
      amenities,
      features,
      restrictions,
      dateRange,
      availability,
      page = 1,
      limit = 10,
      sortBy = 'newest',
      radius = null // For location-based search
    } = req.body;

    // Build comprehensive search filters
    const searchFilters = {};
    
    if (location) {
      searchFilters.location = location;
    }
    
    if (priceRange) {
      if (priceRange.min !== undefined) {
        searchFilters.priceMin = priceRange.min;
      }
      if (priceRange.max !== undefined) {
        searchFilters.priceMax = priceRange.max;
      }
    }
    
    if (capacity) {
      searchFilters.capacity = capacity;
    }
    
    if (purposes && purposes.length > 0) {
      searchFilters.purposes = purposes;
    }
    
    if (amenities && amenities.length > 0) {
      searchFilters.amenities = amenities;
    }
    
    if (features && features.length > 0) {
      searchFilters.features = features;
    }
    
    if (restrictions && restrictions.length > 0) {
      searchFilters.restrictions = restrictions;
    }

    // Date range filtering (for availability)
    let availabilityFilter = null;
    if (dateRange && dateRange.start && dateRange.end) {
      availabilityFilter = {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      };
    }

    // Search options
    const searchOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      availability: availabilityFilter,
      radius // For geospatial search (future implementation)
    };

    // Search spaces through service layer
    const result = await searchSpacesService(searchFilters, searchOptions);

    // If availability filter was provided, we need to filter results
    let filteredDocs = result.docs;
    if (availabilityFilter) {
      // Import booking service to check availability
      const { BookingRepository } = await import('../../services/bookings/booking.service.js');
      
      const availableSpaceIds = [];
      for (const space of result.docs) {
        const conflicts = await BookingRepository.findConflicts(
          space._id,
          availabilityFilter.start,
          availabilityFilter.end
        );
        
        if (conflicts.length === 0) {
          availableSpaceIds.push(space._id);
        }
      }
      
      // Filter docs to only include available spaces
      filteredDocs = result.docs.filter(space => 
        availableSpaceIds.includes(space._id)
      );
    }

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Advanced space search completed', {
      filterCount: Object.keys(searchFilters).length,
      resultsCount: filteredDocs.length,
      totalAvailable: filteredDocs.length,
      responseTime: `${responseTime}ms`
    });

    // Format response with additional metadata
    const response = {
      success: true,
      message: 'Advanced search completed successfully',
      data: {
        spaces: filteredDocs.map(space => ({
          _id: space._id,
          title: space.title,
          description: space.description,
          location: space.location,
          pricePerHour: space.pricePerHour,
          capacity: space.capacity,
          purposes: space.purposes || [],
          amenities: space.amenities || [],
          images: space.images || [],
          host: space.hostId ? {
            _id: space.hostId._id,
            fullname: space.hostId.fullname,
            profilePic: space.hostId.profilePic
          } : null,
          rating: space.rating || 0,
          createdAt: space.createdAt
        })),
        pagination: {
          currentPage: result.page,
          totalPages: Math.ceil(filteredDocs.length / searchOptions.limit),
          totalSpaces: filteredDocs.length,
          hasNextPage: filteredDocs.length > searchOptions.limit * searchOptions.page,
          hasPrevPage: searchOptions.page > 1
        },
        filters: {
          ...searchFilters,
          dateRange,
          availability
        },
        searchCriteria: {
          totalFilters: Object.keys(searchFilters).length,
          hasAvailabilityFilter: !!availabilityFilter,
          hasDateRange: !!dateRange,
          sortBy
        },
        timestamp: new Date().toISOString()
      }
    };

    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to perform advanced space search', {
      body: req.body,
      userId: req.user?._id,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatSpaceErrorResponse(error.message, error.code)
      );
    }

    res.status(500).json(
      formatSpaceErrorResponse('Internal server error while performing advanced search')
    );
  }
};