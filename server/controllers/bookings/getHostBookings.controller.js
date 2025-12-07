import { getHostBookingsService } from '../../services/bookings/booking.service.js';
import { formatHostBookingsResponse, formatBookingErrorResponse } from '../../utils/dto/booking.dto.js';
import logger from '../../config/logger.js';

/**
 * Get Host Bookings Controller
 * 
 * Handles GET /api/v1/host/bookings
 * Retrieves all bookings for spaces owned by the authenticated host with filtering and pagination
 */
export const getHostBookings = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user; // Assuming user info is in req.user from auth middleware
  
  // Verify user is a host
  if (role !== 'host') {
    return res.status(403).json(
      formatBookingErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
    );
  }

  const { page = 1, limit = 10, status, spaceId } = req.query;

  try {
    logger.info('GetHostBookings request started', {
      hostId,
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

    if (status && !['pending', 'upcoming', 'in_progress', 'completed', 'cancelled', 'rejected', 'confirmed'].includes(status)) {
      return res.status(400).json(
        formatBookingErrorResponse('Invalid status filter', 'INVALID_STATUS', {
          allowedValues: ['pending', 'upcoming', 'in_progress', 'completed', 'cancelled', 'rejected', 'confirmed']
        })
      );
    }

    // Get bookings from service layer
    const result = await getHostBookingsService({
      hostId,
      status,
      spaceId,
      page: pageNum,
      limit: limitNum
    });

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Host bookings retrieved successfully', {
      hostId,
      totalBookings: result.bookings.length,
      pagination: result.pagination,
      appliedFilters: { status, spaceId },
      responseTime: `${responseTime}ms`
    });

    // Format and send response using DTO
    const response = formatHostBookingsResponse(result.bookings, result.pagination);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to retrieve host bookings', {
      hostId,
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
      formatBookingErrorResponse('Internal server error while retrieving host bookings')
    );
  }
};

/**
 * Get Host Bookings Statistics
 * 
 * Provides aggregated statistics for host bookings
 */
export const getHostBookingsStats = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  
  // Verify user is a host
  if (role !== 'host') {
    return res.status(403).json(
      formatBookingErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
    );
  }

  try {
    logger.info('GetHostBookingsStats request started', {
      hostId
    });

    const { period = '30d', spaceId } = req.query;

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y', 'all'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json(
        formatBookingErrorResponse('Invalid period', 'INVALID_PERIOD', {
          allowedValues: validPeriods
        })
      );
    }

    // Calculate date range based on period
    let dateFilter = {};
    if (period !== 'all') {
      const days = parseInt(period.replace('d', '').replace('y', '')) * (period.includes('y') ? 365 : 1);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      dateFilter = { createdAt: { $gte: fromDate } };
    }

    // Prepare filters
    const filters = dateFilter;
    if (spaceId) {
      filters.spaceId = spaceId;
    }

    // Get bookings statistics from service layer
    const { BookingRepository } = await import('../../services/bookings/booking.service.js');
    const stats = await BookingRepository.getStatistics(filters);

    // Calculate additional metrics
    const totalBookings = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);
    const totalRevenue = Object.values(stats).reduce((sum, stat) => sum + stat.totalRevenue, 0);

    const response = {
      success: true,
      message: 'Host booking statistics retrieved successfully',
      data: {
        period,
        totalBookings,
        totalRevenue,
        breakdown: stats,
        dateRange: period !== 'all' ? {
          from: dateFilter.createdAt?.$gte,
          to: new Date()
        } : null
      }
    };

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Host booking statistics retrieved successfully', {
      hostId,
      period,
      totalBookings,
      totalRevenue,
      responseTime: `${responseTime}ms`
    });

    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to retrieve host booking statistics', {
      hostId,
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
      formatBookingErrorResponse('Internal server error while retrieving booking statistics')
    );
  }
};

/**
 * Get Host Bookings for a Specific Space
 * 
 * Handles GET /api/v1/host/bookings/space/:spaceId
 * Retrieves bookings for a specific space owned by the host
 */
export const getHostSpaceBookings = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const { spaceId } = req.params;
  
  // Verify user is a host
  if (role !== 'host') {
    return res.status(403).json(
      formatBookingErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
    );
  }

  const { page = 1, limit = 10, status } = req.query;

  try {
    logger.info('GetHostSpaceBookings request started', {
      hostId,
      spaceId,
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

    // Get bookings for specific space from service layer
    const result = await getHostBookingsService({
      hostId,
      status,
      spaceId,
      page: pageNum,
      limit: limitNum
    });

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Host space bookings retrieved successfully', {
      hostId,
      spaceId,
      totalBookings: result.bookings.length,
      pagination: result.pagination,
      responseTime: `${responseTime}ms`
    });

    // Format and send response
    const response = formatHostBookingsResponse(result.bookings, result.pagination);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to retrieve host space bookings', {
      hostId,
      spaceId,
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
      formatBookingErrorResponse('Internal server error while retrieving space bookings')
    );
  }
};