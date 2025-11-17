import { 
  getSpaceByIdService,
  updateSpaceService,
  deleteSpaceService,
  getHostSpacesService
} from '../../services/spaces/space.service.js';
import { 
  formatSpaceResponse,
  formatSpacesListResponse,
  formatSpaceUpdateResponse,
  formatSpaceDeletionResponse,
  formatHostSpacesResponse,
  formatSpaceErrorResponse, 
  formatSpaceValidationError
} from '../../utils/dto/space.dto.js';
import logger from '../../config/logger.js';

/**
 * Get Space Details Controller
 * 
 * Handles GET /api/v1/spaces/:id
 * Retrieves detailed information about a specific space
 */
export const getSpaceDetails = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info('GetSpaceDetails request started', {
      spaceId: id,
      userId: req.user?._id
    });

    // Get space details through service layer
    const space = await getSpaceByIdService(id);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Space details retrieved successfully', {
      spaceId: id,
      responseTime: `${responseTime}ms`
    });

    // Format and send response using DTO
    const response = {
      success: true,
      message: 'Space details retrieved successfully',
      data: formatSpaceResponse(space)
    };
    
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to get space details', {
      spaceId: id,
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
      formatSpaceErrorResponse('Internal server error while retrieving space details')
    );
  }
};

/**
 * Update Space Controller
 * 
 * Handles PUT /api/v1/spaces/:id
 * Updates space information with validation
 */
export const updateSpace = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const { id } = req.params;

  try {
    logger.info('UpdateSpace request started', {
      spaceId: id,
      hostId,
      hasBody: !!Object.keys(req.body).length,
      hasFiles: !!(req.files && req.files.length > 0)
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatSpaceErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // Validate required fields
    if (!id) {
      return res.status(400).json(
        formatSpaceValidationError('Space ID is required')
      );
    }

    // Handle multipart form data - remove file-related fields before validation
    const bodyToValidate = { ...req.body };
    delete bodyToValidate.images;
    delete bodyToValidate.timeSlots;

    // Basic validation
    if (req.body.title && req.body.title.trim().length < 5) {
      return res.status(400).json(
        formatSpaceValidationError('Title must be at least 5 characters long')
      );
    }

    if (req.body.description && req.body.description.trim().length < 20) {
      return res.status(400).json(
        formatSpaceValidationError('Description must be at least 20 characters long')
      );
    }

    if (req.body.pricePerHour) {
      const price = parseFloat(req.body.pricePerHour);
      if (isNaN(price) || price < 0) {
        return res.status(400).json(
          formatSpaceValidationError('Valid price per hour is required')
        );
      }
    }

    if (req.body.capacity) {
      const capacity = parseInt(req.body.capacity);
      if (isNaN(capacity) || capacity < 1) {
        return res.status(400).json(
          formatSpaceValidationError('Valid capacity is required')
        );
      }
    }

    // Validate arrays if provided
    if (req.body.purposes && !Array.isArray(req.body.purposes)) {
      return res.status(400).json(
        formatSpaceValidationError('Purposes must be an array')
      );
    }

    if (req.body.amenities && !Array.isArray(req.body.amenities)) {
      return res.status(400).json(
        formatSpaceValidationError('Amenities must be an array')
      );
    }

    // Validate files if present
    const files = req.files || [];
    if (files.length > 5) {
      return res.status(400).json(
        formatSpaceValidationError('Maximum 5 images allowed per space')
      );
    }

    // Prepare update data
    const updateData = { ...req.body };
    if (req.body.pricePerHour) {
      updateData.pricePerHour = parseFloat(req.body.pricePerHour);
    }
    if (req.body.capacity) {
      updateData.capacity = parseInt(req.body.capacity);
    }
    if (req.body.purposes && Array.isArray(req.body.purposes)) {
      updateData.purposes = req.body.purposes;
    }
    if (req.body.amenities && Array.isArray(req.body.amenities)) {
      updateData.amenities = req.body.amenities;
    }

    // Update space through service layer
    const updatedSpace = await updateSpaceService(id, updateData, files, hostId);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Space updated successfully', {
      spaceId: id,
      hostId,
      updatedFields: Object.keys(updateData),
      newImageCount: files.length,
      responseTime: `${responseTime}ms`
    });

    // Format and send response using DTO
    const response = formatSpaceUpdateResponse(updatedSpace);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to update space', {
      spaceId: id,
      hostId,
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
      formatSpaceErrorResponse('Internal server error while updating space')
    );
  }
};

/**
 * Delete Space Controller
 * 
 * Handles DELETE /api/v1/spaces/:id
 * Soft deletes a space (sets isActive to false)
 */
export const deleteSpace = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const { id } = req.params;

  try {
    logger.info('DeleteSpace request started', {
      spaceId: id,
      hostId
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatSpaceErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // Validate required fields
    if (!id) {
      return res.status(400).json(
        formatSpaceValidationError('Space ID is required')
      );
    }

    // Delete space through service layer
    const result = await deleteSpaceService(id, hostId);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Space deleted successfully', {
      spaceId: id,
      hostId,
      responseTime: `${responseTime}ms`
    });

    // Format and send response using DTO
    const response = formatSpaceDeletionResponse(id);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to delete space', {
      spaceId: id,
      hostId,
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
      formatSpaceErrorResponse('Internal server error while deleting space')
    );
  }
};

/**
 * Get Host Spaces Controller
 * 
 * Handles GET /api/v1/host/spaces
 * Retrieves all spaces for the authenticated host
 */
export const getHostSpaces = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const { page = 1, limit = 10 } = req.query;

  try {
    logger.info('GetHostSpaces request started', {
      hostId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatSpaceErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json(
        formatSpaceValidationError('Invalid pagination parameters')
      );
    }

    // Get host spaces through service layer
    const result = await getHostSpacesService(hostId, {
      page: pageNum,
      limit: limitNum
    });

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Host spaces retrieved successfully', {
      hostId,
      spacesCount: result.totalDocs,
      page: pageNum,
      limit: limitNum,
      responseTime: `${responseTime}ms`
    });

    // Format and send response using DTO
    const response = formatHostSpacesResponse(result.docs, result);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to get host spaces', {
      hostId,
      page,
      limit,
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
      formatSpaceErrorResponse('Internal server error while retrieving host spaces')
    );
  }
};

/**
 * Get Host Space Analytics
 * 
 * Handles GET /api/v1/host/spaces/analytics
 * Returns analytics and statistics for host's spaces
 */
export const getHostSpaceAnalytics = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const { spaceId, timeRange = '30d' } = req.query;

  try {
    logger.info('GetHostSpaceAnalytics request started', {
      hostId,
      spaceId,
      timeRange
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatSpaceErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // If specific space ID provided, validate access
    if (spaceId) {
      const space = await getSpaceByIdService(spaceId);
      if (!space.hostId || space.hostId._id.toString() !== hostId.toString()) {
        return res.status(403).json(
          formatSpaceErrorResponse('Access denied. You can only view analytics for your own spaces.', 'SPACE_OWNERSHIP_REQUIRED')
        );
      }
    }

    // For now, return basic analytics structure
    // In a full implementation, this would aggregate data from bookings, reviews, etc.
    const analytics = {
      success: true,
      message: 'Space analytics retrieved successfully',
      data: {
        overview: {
          totalSpaces: spaceId ? 1 : 'N/A', // Would be actual count
          activeSpaces: spaceId ? 1 : 'N/A', // Would be actual count
          totalBookings: 0, // Would aggregate from bookings
          totalRevenue: 0, // Would aggregate from completed bookings
          averageRating: 0 // Would aggregate from reviews
        },
        timeRange,
        spaceId: spaceId || null,
        generatedAt: new Date().toISOString(),
        // Placeholder for future analytics data
        upcomingBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        averageBookingValue: 0,
        mostPopularTimeSlots: [],
        monthlyTrends: []
      }
    };

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Host space analytics retrieved', {
      hostId,
      spaceId,
      timeRange,
      responseTime: `${responseTime}ms`
    });

    res.status(200).json(analytics);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to get host space analytics', {
      hostId,
      spaceId,
      timeRange,
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
      formatSpaceErrorResponse('Internal server error while retrieving analytics')
    );
  }
};

/**
 * Toggle Space Active Status
 * 
 * Handles PATCH /api/v1/spaces/:id/toggle-status
 * Allows hosts to activate/deactivate their spaces
 */
export const toggleSpaceStatus = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    logger.info('ToggleSpaceStatus request started', {
      spaceId: id,
      hostId,
      requestedStatus: isActive
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatSpaceErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // Validate required fields
    if (!id) {
      return res.status(400).json(
        formatSpaceValidationError('Space ID is required')
      );
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json(
        formatSpaceValidationError('isActive must be a boolean value')
      );
    }

    // Update space status through service layer
    const updatedSpace = await updateSpaceService(id, { isActive }, [], hostId);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Space status toggled successfully', {
      spaceId: id,
      hostId,
      newStatus: isActive,
      responseTime: `${responseTime}ms`
    });

    // Format response
    const response = {
      success: true,
      message: `Space ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        spaceId: id,
        isActive,
        updatedAt: updatedSpace.updatedAt
      }
    };

    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to toggle space status', {
      spaceId: id,
      hostId,
      requestedStatus: isActive,
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
      formatSpaceErrorResponse('Internal server error while toggling space status')
    );
  }
};