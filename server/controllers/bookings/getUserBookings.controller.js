import { getUserBookingsService } from '../../services/bookings/booking.service.js';
import { formatUserBookingsResponse, formatBookingErrorResponse } from '../../utils/dto/booking.dto.js';
import logger from '../../config/logger.js';

/**
 * Get User Bookings Controller
 * 
 * Handles GET /api/v1/bookings/me
 * Retrieves all bookings for the authenticated user with filtering and pagination
 */
export const getUserBookings = async (req, res) => {
  const startTime = Date.now();
  const { userId } = req.user; // Assuming user info is in req.user from auth middleware
  const { page = 1, limit = 10, status } = req.query;

  try {
    logger.info('GetUserBookings request started', {
      userId,
      query: req.query
    });

    // Validate query parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (pageNum < 1) {
      return res.status(400).json(
        formatBookingErrorResponse('Page number must be greater than 0', 'INVALID_PAGE_NUMBER')
      );
    }

    if (limitNum < 1 || limitNum > 100) {
      return res.status(400).json(
        formatBookingErrorResponse('Limit must be between 1 and 100', 'INVALID_LIMIT')
      );
    }

    if (status && !['pending', 'upcoming', 'in_progress', 'completed', 'cancelled', 'rejected'].includes(status)) {
      return res.status(400).json(
        formatBookingErrorResponse('Invalid status filter', 'INVALID_STATUS', {
          allowedValues: ['pending', 'upcoming', 'in_progress', 'completed', 'cancelled', 'rejected']
        })
      );
    }

    // Get bookings from service layer
    const result = await getUserBookingsService({
      userId,
      status,
      page: pageNum,
      limit: limitNum
    });

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('User bookings retrieved successfully', {
      userId,
      totalBookings: result.bookings.length,
      pagination: result.pagination,
      responseTime: `${responseTime}ms`
    });

    // Format and send response using DTO
    const response = formatUserBookingsResponse(result.bookings, result.pagination);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to retrieve user bookings', {
      userId,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    // Determine appropriate error response based on error type
    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatBookingErrorResponse(error.message, error.code)
      );
    }

    // Default server error
    res.status(500).json(
      formatBookingErrorResponse('Internal server error while retrieving bookings')
    );
  }
};

/**
 * Get User Bookings with Enhanced Filtering
 * 
 * Extended version that supports additional filtering options
 */
export const getUserBookingsAdvanced = async (req, res) => {
  const startTime = Date.now();
  const { userId } = req.user;
  const { 
    page = 1, 
    limit = 10, 
    status,
    dateFrom,
    dateTo,
    minPrice,
    maxPrice,
    spaceType
  } = req.query;

  try {
    logger.info('GetUserBookingsAdvanced request started', {
      userId,
      query: req.query
    });

    // Enhanced validation
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (pageNum < 1) {
      return res.status(400).json(
        formatBookingErrorResponse('Page number must be greater than 0', 'INVALID_PAGE_NUMBER')
      );
    }

    if (limitNum < 1 || limitNum > 100) {
      return res.status(400).json(
        formatBookingErrorResponse('Limit must be between 1 and 100', 'INVALID_LIMIT')
      );
    }

    // Validate date filters
    const dateFilters = {};
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (isNaN(fromDate.getTime())) {
        return res.status(400).json(
          formatBookingErrorResponse('Invalid dateFrom format', 'INVALID_DATE_FROM')
        );
      }
      dateFilters.startTime = { $gte: fromDate };
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      if (isNaN(toDate.getTime())) {
        return res.status(400).json(
          formatBookingErrorResponse('Invalid dateTo format', 'INVALID_DATE_TO')
        );
      }
      dateFilters.endTime = { $lte: toDate };
    }

    // Validate price filters
    const priceFilters = {};
    if (minPrice !== undefined) {
      const min = parseFloat(minPrice);
      if (isNaN(min) || min < 0) {
        return res.status(400).json(
          formatBookingErrorResponse('Invalid minPrice format', 'INVALID_MIN_PRICE')
        );
      }
      priceFilters.totalAmount = { ...priceFilters.totalAmount, $gte: min };
    }

    if (maxPrice !== undefined) {
      const max = parseFloat(maxPrice);
      if (isNaN(max) || max < 0) {
        return res.status(400).json(
          formatBookingErrorResponse('Invalid maxPrice format', 'INVALID_MAX_PRICE')
        );
      }
      priceFilters.totalAmount = { ...priceFilters.totalAmount, $lte: max };
    }

    // Combine all filters
    const combinedFilters = {
      userId,
      ...(status && { status }),
      ...dateFilters,
      ...priceFilters
    };

    // Get bookings from service layer
    const result = await getUserBookingsService({
      userId,
      filters: combinedFilters,
      page: pageNum,
      limit: limitNum
    });

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('User bookings (advanced) retrieved successfully', {
      userId,
      totalBookings: result.bookings.length,
      pagination: result.pagination,
      appliedFilters: { status, dateFrom, dateTo, minPrice, maxPrice },
      responseTime: `${responseTime}ms`
    });

    // Format and send response
    const response = formatUserBookingsResponse(result.bookings, result.pagination);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to retrieve user bookings (advanced)', {
      userId,
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    // Return appropriate error response
    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatBookingErrorResponse(error.message, error.code)
      );
    }

    res.status(500).json(
      formatBookingErrorResponse('Internal server error while retrieving bookings')
    );
  }
};