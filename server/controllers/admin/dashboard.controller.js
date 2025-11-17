import adminService from '../../services/admin/admin.service.js';
import logger from '../../config/logger.js';

/**
 * @desc    Get admin dashboard metrics overview
 * @route   GET /api/v1/admin/dashboard/metrics
 * @access  Private/Admin
 */
const getDashboardMetrics = async (req, res) => {
  try {
    const result = await adminService.getDashboardMetrics(req.user);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('AdminController.getDashboardMetrics failed', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
    });
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to retrieve dashboard metrics';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * @desc    Get admin action statistics
 * @route   GET /api/v1/admin/dashboard/statistics
 * @access  Private/Admin
 */
const getAdminStatistics = async (req, res) => {
  try {
    const result = await adminService.getAdminStatistics(req.user);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('AdminController.getAdminStatistics failed', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
    });
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to retrieve admin statistics';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * @desc    Get admin action logs
 * @route   GET /api/v1/admin/dashboard/action-logs
 * @access  Private/Admin
 */
const getActionLogs = async (req, res) => {
  try {
    const { action, entityType, adminId, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const filters = {
      ...(action && { action }),
      ...(entityType && { entityType }),
      ...(adminId && { adminId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
    
    const result = await adminService.getActionLogs(
      filters,
      { page: parseInt(page), limit: parseInt(limit) },
      req.user
    );
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('AdminController.getActionLogs failed', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
    });
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to retrieve action logs';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export {
  getDashboardMetrics,
  getAdminStatistics,
  getActionLogs
};

export default {
  getDashboardMetrics,
  getAdminStatistics,
  getActionLogs
};