import logger from '../../../config/logger.js';
import adminService from '../../../services/admin/admin.service.js';

/**
 * @desc    Reactivate a suspended user account
 * @route   PATCH /api/v1/admin/users/:id/reactivate
 * @access  Private/Admin
 */
const reactivateUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { reason = 'Account reactivated by admin' } = req.body;

    // Validate request
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Call service to reactivate user
    const result = await adminService.reactivateUser(userId, req.user, reason);

    res.status(200).json(result);
  } catch (error) {
    logger.error('AdminController.reactivateUser failed', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      userId: req.params.id,
    });
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to reactivate user';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export default reactivateUser;
