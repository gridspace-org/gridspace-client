import { 
  createSpaceService, 
  validateSpaceData 
} from '../../services/spaces/space.service.js';
import { 
  formatSpaceCreationResponse, 
  formatSpaceErrorResponse, 
  formatSpaceValidationError,
  formatImageUploadResponse
} from '../../utils/dto/space.dto.js';
import logger from '../../config/logger.js';

/**
 * Create Space Controller
 * 
 * Handles POST /api/v1/spaces
 * Creates a new space with image upload and business rule validation
 */
export const createSpace = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user; // Assuming user info is in req.user from auth middleware

  try {
    logger.info('CreateSpace request started', {
      hostId,
      role,
      hasFiles: !!(req.files && req.files.length > 0)
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatSpaceErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // The request may be multipart/form-data (uploaded files). Some clients may send
    // file-related fields in req.body (e.g., "images" or "timeSlots") which are
    // not part of the Joi create schema (or are expected to be handled via files).
    // Strip those before validation to avoid "unknown" field errors.
    const bodyToValidate = { ...req.body };
    delete bodyToValidate.images;
    delete bodyToValidate.timeSlots;

    // Validate space data using service layer validation
    const { isValid, errors } = validateSpaceData({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      pricePerHour: req.body.pricePerHour,
      capacity: req.body.capacity,
      purposes: req.body.purposes,
      amenities: req.body.amenities
    });

    if (!isValid) {
      logger.warn('CreateSpace validation failed', {
        hostId,
        errors
      });
      return res.status(400).json(
        formatSpaceValidationError(errors)
      );
    }

    // Validate files if present
    const files = req.files || [];
    if (files.length > 5) {
      return res.status(400).json(
        formatSpaceValidationError('Maximum 5 images allowed per space')
      );
    }

    // Prepare space data with host ID
    const spaceData = {
      ...req.body,
      hostId: hostId
    };

    // Create space through service layer
    const space = await createSpaceService(spaceData, files);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Space created successfully', {
      spaceId: space._id,
      hostId,
      title: space.title,
      imageCount: space.images?.length || 0,
      responseTime: `${responseTime}ms`
    });

    // Format and send response using DTO
    const response = formatSpaceCreationResponse(space);
    res.status(201).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to create space', {
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
      formatSpaceErrorResponse('Internal server error while creating space')
    );
  }
};

/**
 * Create Space with Advanced Validation
 * 
 * Extended version with additional validation steps
 */
export const createSpaceAdvanced = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const {
    title,
    description,
    location,
    pricePerHour,
    capacity,
    purposes,
    amenities,
    rules,
    features,
    restrictions
  } = req.body;

  try {
    logger.info('CreateSpaceAdvanced request started', {
      hostId,
      title,
      pricePerHour,
      capacity,
      hasFeatures: !!(features && features.length > 0),
      hasRestrictions: !!(restrictions && restrictions.length > 0)
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatSpaceErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // Enhanced validation
    const validationErrors = [];

    // Basic field validation
    if (!title || title.trim().length < 5) {
      validationErrors.push('Title must be at least 5 characters long');
    }

    if (!description || description.trim().length < 20) {
      validationErrors.push('Description must be at least 20 characters long');
    }

    if (!location || location.trim().length < 3) {
      validationErrors.push('Location must be at least 3 characters long');
    }

    // Price validation
    const price = parseFloat(pricePerHour);
    if (!price || price <= 0) {
      validationErrors.push('Valid price per hour is required');
    } else if (price < 100) {
      validationErrors.push('Price per hour must be at least ₦100');
    } else if (price > 100000) {
      validationErrors.push('Price per hour cannot exceed ₦100,000');
    }

    // Capacity validation
    const cap = parseInt(capacity);
    if (!cap || cap < 1) {
      validationErrors.push('Valid capacity is required');
    } else if (cap > 1000) {
      validationErrors.push('Capacity cannot exceed 1000 people');
    }

    // Arrays validation
    if (purposes && !Array.isArray(purposes)) {
      validationErrors.push('Purposes must be an array');
    }

    if (amenities && !Array.isArray(amenities)) {
      validationErrors.push('Amenities must be an array');
    }

    if (features && !Array.isArray(features)) {
      validationErrors.push('Features must be an array');
    }

    if (restrictions && !Array.isArray(restrictions)) {
      validationErrors.push('Restrictions must be an array');
    }

    // File validation
    const files = req.files || [];
    if (files.length > 5) {
      validationErrors.push('Maximum 5 images allowed per space');
    }

    // Additional file type validation would go here

    if (validationErrors.length > 0) {
      return res.status(400).json(
        formatSpaceValidationError(validationErrors)
      );
    }

    // Prepare space data
    const spaceData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      pricePerHour: price,
      capacity: cap,
      purposes: Array.isArray(purposes) ? purposes : [],
      amenities: Array.isArray(amenities) ? amenities : [],
      rules: rules ? rules.trim() : '',
      features: Array.isArray(features) ? features : [],
      restrictions: Array.isArray(restrictions) ? restrictions : [],
      hostId
    };

    // Create space through service layer
    const space = await createSpaceService(spaceData, files);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Space created successfully (advanced)', {
      spaceId: space._id,
      hostId,
      title: space.title,
      featuresCount: space.features?.length || 0,
      restrictionsCount: space.restrictions?.length || 0,
      responseTime: `${responseTime}ms`
    });

    // Format response
    const response = formatSpaceCreationResponse(space);
    res.status(201).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to create space (advanced)', {
      hostId,
      title,
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
      formatSpaceErrorResponse('Internal server error while creating space')
    );
  }
};

/**
 * Upload Images for Space
 * 
 * Handles POST /api/v1/spaces/upload-images
 * Allows hosts to upload additional images for their spaces
 */
export const uploadSpaceImages = async (req, res) => {
  const startTime = Date.now();
  const { _id: hostId, role } = req.user;
  const { spaceId } = req.body;

  try {
    logger.info('UploadSpaceImages request started', {
      hostId,
      spaceId,
      fileCount: req.files?.length || 0
    });

    // Verify user is a host
    if (role !== 'host') {
      return res.status(403).json(
        formatSpaceErrorResponse('Access denied. Host role required.', 'HOST_ROLE_REQUIRED')
      );
    }

    // Validate required fields
    if (!spaceId) {
      return res.status(400).json(
        formatSpaceValidationError('Space ID is required')
      );
    }

    // Validate files
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json(
        formatSpaceValidationError('At least one image file is required')
      );
    }

    if (files.length > 5) {
      return res.status(400).json(
        formatSpaceValidationError('Maximum 5 images allowed')
      );
    }

    // Import required services
    const { getSpaceByIdService } = await import('../../services/spaces/space.service.js');
    
    // Verify space exists and belongs to host
    const space = await getSpaceByIdService(spaceId);
    if (!space.hostId || space.hostId._id.toString() !== hostId.toString()) {
      return res.status(403).json(
        formatSpaceErrorResponse('Access denied. You can only upload images to your own spaces.', 'SPACE_OWNERSHIP_REQUIRED')
      );
    }

    // Check if space already has maximum images
    if (space.images && space.images.length >= 5) {
      return res.status(400).json(
        formatSpaceErrorResponse('Space already has maximum number of images (5)', 'MAX_IMAGES_REACHED')
      );
    }

    // Calculate how many more images can be added
    const remainingSlots = 5 - (space.images?.length || 0);
    if (files.length > remainingSlots) {
      return res.status(400).json(
        formatSpaceErrorResponse(`Only ${remainingSlots} more images can be added to this space`, 'TOO_MANY_IMAGES')
      );
    }

    // Upload images using service layer
    const { uploadSpaceImages: uploadImagesService } = await import('../../services/spaces/space.service.js');
    const imageUrls = await uploadImagesService(files);

    // Log success
    const responseTime = Date.now() - startTime;
    logger.info('Space images uploaded successfully', {
      spaceId,
      hostId,
      uploadedCount: imageUrls.length,
      responseTime: `${responseTime}ms`
    });

    // Format response
    const response = formatImageUploadResponse(imageUrls);
    res.status(200).json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Failed to upload space images', {
      hostId,
      spaceId,
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
      formatSpaceErrorResponse('Internal server error while uploading images')
    );
  }
};

/**
 * Validate Space Data
 * 
 * Handles POST /api/v1/spaces/validate
 * Validates space data without creating the space
 */
export const validateSpaceDataController = async (req, res) => {
  try {
    logger.info('ValidateSpaceData request started', {
      userId: req.user?._id
    });

    // Use service layer validation
    const { isValid, errors } = validateSpaceData(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: {
          isValid: false,
          errors
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Space data is valid',
      data: {
        isValid: true,
        errors: []
      }
    });

  } catch (error) {
    logger.error('Failed to validate space data', {
      userId: req.user?._id,
      error: error.message
    });

    res.status(500).json(
      formatSpaceErrorResponse('Internal server error while validating space data')
    );
  }
};