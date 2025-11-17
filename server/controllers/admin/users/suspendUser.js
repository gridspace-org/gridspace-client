import logger from '../../../config/logger.js';
import adminService from '../../../services/admin/admin.service.js';

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

export default suspendUser;
