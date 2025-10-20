import Space from '../models/Space.model.js';
import SearchAnalytics from '../models/SearchAnalytics.model.js';
import { createSpaceValidation, updateSpaceValidation, searchSpacesValidation } from '../validators/space.validator.js';
import logger from '../config/logger.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Create a new space with image upload
 * O(n) image processing + O(1) database insert
 */
export const createSpace = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createSpaceValidation.validate(req.body);
    if (error) {
      logger.warn('Space creation validation failed', {
        userId: req.user._id,
        errors: error.details
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if user is a verified host
    if (req.user.role !== 'host') {
      logger.warn('Non-host user attempted space creation', {
        userId: req.user._id,
        userRole: req.user.role
      });
      return res.status(403).json({
        success: false,
        message: 'Only hosts can create spaces'
      });
    }

    // Handle image uploads (max 5 images)
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 images allowed per space'
        });
      }

      // Upload images to Cloudinary with optimization
      for (const file of req.files) {
        try {
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: 'workspace-spaces',
            quality: 'auto:good',
            fetch_format: 'auto',
            width: 1200,
            crop: 'limit',
            resource_type: 'image'
          });
          imageUrls.push(uploadResult.secure_url);
          logger.info('Space image uploaded successfully', {
            spaceId: 'new',
            imageUrl: uploadResult.secure_url
          });
        } catch (uploadError) {
          logger.error('Space image upload failed', {
            error: uploadError.message,
            fileName: file.originalname
          });
          return res.status(500).json({
            success: false,
            message: `Failed to upload image: ${file.originalname}`
          });
        }
      }
    }

    // Create space document
    const spaceData = {
      ...value,
      hostId: req.user._id,
      images: imageUrls,
      isActive: true
    };

    const space = new Space(spaceData);
    await space.save();

    logger.info('Space created successfully', {
      spaceId: space._id,
      hostId: req.user._id,
      title: space.title,
      imageCount: imageUrls.length
    });

    res.status(201).json({
      success: true,
      message: 'Space created successfully',
      data: space
    });

  } catch (error) {
    logger.error('Space creation failed', {
      error: error.message,
      hostId: req.user?._id,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error during space creation',
      error: error.message
    });
  }
};

/**
 * Advanced space search with filtering and analytics
 * O(log n) with proper indexing + O(1) analytics logging
 */
export const getSpaces = async (req, res) => {
  try {
    // Validate search parameters
    const { error, value } = searchSpacesValidation.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        errors: error.details.map(detail => detail.message)
      });
    }

    const {
      location,
      priceMin,
      priceMax,
      capacity,
      purposes,
      amenities,
      page,
      limit,
      sortBy
    } = value;

    // Build filter query
    const filter = { isActive: true };
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (priceMin || priceMax) {
      filter.pricePerHour = {};
      if (priceMin) filter.pricePerHour.$gte = priceMin;
      if (priceMax) filter.pricePerHour.$lte = priceMax;
    }
    
    if (capacity) {
      filter.capacity = { $gte: capacity };
    }
    
    if (purposes && purposes.length > 0) {
      filter.purposes = { $in: purposes };
    }
    
    if (amenities && amenities.length > 0) {
      filter.amenities = { $all: amenities };
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price_low_high':
        sortOptions = { pricePerHour: 1 };
        break;
      case 'price_high_low':
        sortOptions = { pricePerHour: -1 };
        break;
      case 'rating':
        // Will need to join with reviews for average rating
        sortOptions = { createdAt: -1 };
        break;
      case 'most_popular':
        // Will need booking count data
        sortOptions = { createdAt: -1 };
        break;
      default: // 'newest'
        sortOptions = { createdAt: -1 };
    }

    // Execute search with pagination
    const options = {
      page,
      limit,
      sort: sortOptions,
      populate: {
        path: 'hostId',
        select: 'fullname profilePic emailVerified'
      },
      lean: true
    };

    const result = await Space.paginate(filter, options);

    // Log search analytics (non-blocking)
    logSearchAnalytics(req, {
      searchQuery: location,
      filters: { location, priceMin, priceMax, capacity, purposes, amenities },
      resultsCount: result.totalDocs,
      zeroResults: result.totalDocs === 0
    }).catch(err => {
      logger.error('Search analytics logging failed', { error: err.message });
    });

    logger.info('Space search executed', {
      filter,
      resultsCount: result.totalDocs,
      page,
      limit,
      sortBy
    });

    res.status(200).json({
      success: true,
      message: 'Spaces retrieved successfully',
      data: {
        spaces: result.docs,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalSpaces: result.totalDocs,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage
        }
      }
    });

  } catch (error) {
    logger.error('Space search failed', {
      error: error.message,
      query: req.query
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error during space search',
      error: error.message
    });
  }
};

/**
 * Get single space details
 * O(1) with indexed _id lookup
 */
export const getSpace = async (req, res) => {
  try {
    const { id } = req.params;

    const space = await Space.findById(id)
      .populate('hostId', 'fullname profilePic emailVerified createdAt')
      .lean();

    if (!space || !space.isActive) {
      logger.warn('Space not found or inactive', { spaceId: id });
      return res.status(404).json({
        success: false,
        message: 'Space not found or no longer available'
      });
    }

    logger.info('Space details retrieved', { spaceId: id });

    res.status(200).json({
      success: true,
      message: 'Space details retrieved successfully',
      data: space
    });

  } catch (error) {
    logger.error('Get space details failed', {
      error: error.message,
      spaceId: req.params.id
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update a space - host can update their own space
 * O(1) ownership check + O(n) image processing
 */
export const updateSpace = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateSpaceValidation.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Handle new image uploads if any
    let updatedImages = [...req.space.images];
    if (req.files && req.files.length > 0) {
      const newImageUrls = [];
      
      for (const file of req.files) {
        try {
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: 'workspace-spaces',
            quality: 'auto:good',
            fetch_format: 'auto',
            width: 1200,
            crop: 'limit'
          });
          newImageUrls.push(uploadResult.secure_url);
        } catch (uploadError) {
          logger.error('Space image update upload failed', {
            error: uploadError.message,
            spaceId: id
          });
          return res.status(500).json({
            success: false,
            message: `Failed to upload image: ${file.originalname}`
          });
        }
      }

      // Combine existing and new images (max 5 total)
      updatedImages = [...updatedImages, ...newImageUrls].slice(0, 5);
    }

    // Update space
    const updateData = {
      ...value,
      images: updatedImages,
      updatedAt: new Date()
    };

    const updatedSpace = await Space.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('hostId', 'fullname profilePic emailVerified');

    logger.info('Space updated successfully', {
      spaceId: id,
      hostId: req.user._id,
      updatedFields: Object.keys(value)
    });

    res.status(200).json({
      success: true,
      message: 'Space updated successfully',
      data: updatedSpace
    });

  } catch (error) {
    logger.error('Space update failed', {
      error: error.message,
      spaceId: req.params.id,
      hostId: req.user?._id
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error during space update',
      error: error.message
    });
  }
};

/**
 * Delete a space (soft delete)
 * O(1) update operation
 */
export const deleteSpace = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive to false
    await Space.findByIdAndUpdate(id, {
      isActive: false,
      updatedAt: new Date()
    });

    logger.info('Space deleted successfully', {
      spaceId: id,
      hostId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Space deleted successfully'
    });

  } catch (error) {
    logger.error('Space deletion failed', {
      error: error.message,
      spaceId: req.params.id,
      hostId: req.user?._id
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error during space deletion',
      error: error.message
    });
  }
};

/**
 * Get host's own spaces
 * O(1) query with hostId index
 */
export const getMySpaces = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const hostId = req.user._id;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'hostId',
        select: 'fullname profilePic'
      }
    };

    const result = await Space.paginate(
      { hostId, isActive: true },
      options
    );

    logger.info('Host spaces retrieved', {
      hostId,
      spacesCount: result.totalDocs
    });

    res.status(200).json({
      success: true,
      message: 'Your spaces retrieved successfully',
      data: {
        spaces: result.docs,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalSpaces: result.totalDocs,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage
        }
      }
    });

  } catch (error) {
    logger.error('Get host spaces failed', {
      error: error.message,
      hostId: req.user?._id
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Helper function for search analytics logging
 */
const logSearchAnalytics = async (req, searchData) => {
  const analyticsData = {
    userId: req.user?._id || null,
    sessionId: req.sessionID || `anon_${Date.now()}`,
    searchQuery: searchData.searchQuery,
    filters: searchData.filters,
    resultsCount: searchData.resultsCount,
    zeroResults: searchData.zeroResults,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip,
    timestamp: new Date()
  };

  await SearchAnalytics.create(analyticsData);
};

export default {
  createSpace,
  getSpaces,
  getSpace,
  updateSpace,
  deleteSpace,
  getMySpaces
};