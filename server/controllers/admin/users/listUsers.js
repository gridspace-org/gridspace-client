import logger from '../../../config/logger.js';
import adminService from '../../../services/admin/admin.service.js';
import { parsePagination } from '../utils/pagination.js';

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
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(isEmailVerified !== undefined && { isEmailVerified: isEmailVerified === 'true' }),
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
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to retrieve users';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export default listUsers;
