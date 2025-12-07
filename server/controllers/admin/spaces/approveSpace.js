import logger from '../../../config/logger.js';
import adminService from '../../../services/admin/admin.service.js';

/**
 * @desc    Approve a pending space
 * @route   PATCH /api/v1/admin/spaces/:id/approve
 * @access  Private/Admin
 */
const approveSpace = async (req, res) => {
  try {
    const { id: spaceId } = req.params;
    const { notes = '' } = req.body;

    // Validate request
    if (!spaceId) {
      return res.status(400).json({
        success: false,
        message: 'Space ID is required',
      });
    }

    // Call service to approve space
    const result = await adminService.approveSpace(spaceId, req.user, notes);

    res.status(200).json(result);
  } catch (error) {
    logger.error('AdminController.approveSpace failed', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      spaceId: req.params.id,
    });
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to approve space';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export default approveSpace;
