import logger from '../../../config/logger.js';
import adminService from '../../../services/admin/admin.service.js';

/**
 * @desc    Reject a pending space
 * @route   PATCH /api/v1/admin/spaces/:id/reject
 * @access  Private/Admin
 */
const rejectSpace = async (req, res) => {
  try {
    const { id: spaceId } = req.params;
    const { reason = 'Space did not meet requirements' } = req.body;

    // Validate request
    if (!spaceId) {
      return res.status(400).json({
        success: false,
        message: 'Space ID is required',
      });
    }

    // Call service to reject space
    const result = await adminService.rejectSpace(spaceId, req.user, reason);

    res.status(200).json(result);
  } catch (error) {
    logger.error('AdminController.rejectSpace failed', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      spaceId: req.params.id,
    });
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to reject space';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export default rejectSpace;
