import logger from '../../config/logger.js';
import adminService from '../../services/admin/admin.service.js';
import {
  suspendUserValidation,
  reactivateUserValidation,
  approveSpaceValidation,
  rejectSpaceValidation,
} from '../../validators/admin.validator.js';

/**
 * @desc    Parse pagination parameters from request query
 * @param   {Object} query - Request query object
 * @returns {Object} Pagination options
 */
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

/**
 * @desc    Suspend a user account
 * @route   PATCH /api/v1/admin/users/:id/suspend
 * @access  Private/Admin
 */
const suspendUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { reason = 'No reason provided' } = req.body;

    // Validate request
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Call service to suspend user
    const result = await adminService.suspendUser(userId, req.user, reason);

    res.status(200).json(result);
  } catch (error) {
    logger.error('AdminController.suspendUser failed', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      userId: req.params.id,
    });
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to suspend user';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * @desc    Get paginated list of spaces with filters
 * @route   GET /api/v1/admin/spaces
 * @access  Private/Admin
 */
const listSpaces = async (req, res) => {
  try {
    const { 
      status, 
      search, 
      hostId, 
      minPrice, 
      maxPrice, 
      capacity 
    } = req.query;
    
    const { page, limit } = parsePagination(req.query);
    
    const filters = {
      ...(status && { status }),
      ...(search && { search }),
      ...(hostId && { hostId }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(capacity && { capacity }),
    };

    const result = await adminService.listSpaces(
      filters,
      { page, limit },
      req.user
    );

    res.status(200).json(result);
  } catch (error) {
    logger.error('AdminController.listSpaces failed', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve spaces',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * @desc    Get paginated list of users with filters
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
const listUsers = async (req, res) => {
  try {
    const { role, search, isActive, isEmailVerified } = req.query;
    const { page, limit } = parsePagination(req.query);
    
    const filters = {
      ...(role && { role }),
      ...(search && { search }),
      ...(isActive !== undefined && { isActive }),
      ...(isEmailVerified !== undefined && { isEmailVerified }),
    };

    const result = await adminService.listUsers(
      filters,
      { page, limit },
      req.user
    );

    res.status(200).json(result);
  } catch (error) {
    logger.error('AdminController.listUsers failed', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve users',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * @desc    Get paginated list of bookings with filters
 * @route   GET /api/v1/admin/bookings
 * @access  Private/Admin
 */
const listBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const { page, limit } = parsePagination(req.query);
    
    const filters = {};
    if (status) {
      filters.status = status;
    }

    const result = await adminService.listBookings(
      filters,
      { page, limit },
      req.user
    );

    res.status(200).json(result);
  } catch (error) {
    logger.error('AdminController.listBookings failed', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve bookings',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Export all controller functions
export {
  listBookings,
  // Add other controller functions here as we refactor them
};

export default {
  listBookings,
  // Add other controller functions here as we refactor them
};
