import logger from '../../../config/logger.js';
import adminService from '../../../services/admin/admin.service.js';
import { parsePagination } from '../utils/pagination.js';

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
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to retrieve spaces';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export default listSpaces;
