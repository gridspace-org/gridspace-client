import logger from '../../../config/logger.js';
import adminService from '../../../services/admin/admin.service.js';
import { parsePagination } from '../utils/pagination.js';

/**
 * @desc    Get paginated list of bookings with filters
 * @route   GET /api/v1/admin/bookings
 * @access  Private/Admin
 */
const listBookings = async (req, res) => {
  try {
    const { 
      status, 
      spaceId, 
      userId, 
      fromDate, 
      toDate 
    } = req.query;
    
    const { page, limit } = parsePagination(req.query);
    
    const filters = {
      ...(status && { status }),
      ...(spaceId && { spaceId }),
      ...(userId && { userId }),
      ...(fromDate && { fromDate: new Date(fromDate) }),
      ...(toDate && { toDate: new Date(toDate) }),
    };

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
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to retrieve bookings';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export default listBookings;
