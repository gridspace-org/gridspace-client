import adminRepository from '../../repositories/admin.repository.js';
import AppError from '../../utils/AppError.js';
import logger from '../../config/logger.js';
import Booking from '../../models/Booking.model.js';
import WalletTransaction from '../../models/WalletTransaction.model.js';
import walletService from '../wallet/wallet.service.js';
import {
  formatAdminUserResponse,
  formatAdminSpaceResponse,
  formatAdminBookingResponse,
  formatAdminDashboardMetricsResponse,
  formatAdminPaginatedResponse
} from '../../utils/dto/admin.dto.js';

class AdminService {
  /**
   * Get paginated list of bookings with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @param {Object} adminUser - Admin user performing the action
   * @returns {Promise<Object>} Paginated booking results
   */
  async listBookings(filters = {}, pagination = {}, adminUser) {
    const { page = 1, limit = 10 } = pagination;

    try {
      // Log the admin action
      await this.logAdminAction('list_bookings', 'booking', null, { filters, page, limit }, adminUser);

      // Get paginated bookings
      const result = await adminRepository.listBookings(filters, page, limit);

      return formatAdminPaginatedResponse(result.docs, result, 'bookings');
    } catch (error) {
      logger.error('AdminService.listBookings failed', {
        error: error.message,
        stack: error.stack,
        adminId: adminUser._id,
      });
      throw new AppError('Failed to retrieve bookings', 500, error);
    }
  }

  /**
   * Get paginated list of users with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @param {Object} adminUser - Admin user performing the action
   * @returns {Promise<Object>} Paginated user results
   */
  async listUsers(filters = {}, pagination = {}, adminUser) {
    const { page = 1, limit = 20 } = pagination;

    try {
      // Log the admin action
      await this.logAdminAction('list_users', 'user', null, { filters, page, limit }, adminUser);

      // Get paginated users
      const result = await adminRepository.listUsers(filters, page, limit);

      return formatAdminPaginatedResponse(result.docs, result, 'users');
    } catch (error) {
      logger.error('AdminService.listUsers failed', {
        error: error.message,
        stack: error.stack,
        adminId: adminUser?._id,
      });
      throw new AppError('Failed to retrieve users', 500, error);
    }
  }

  /**
   * Get paginated list of spaces with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @param {Object} adminUser - Admin user performing the action
   * @returns {Promise<Object>} Paginated space results
   */
  async listSpaces(filters = {}, pagination = {}, adminUser) {
    const { page = 1, limit = 20 } = pagination;

    try {
      // Log the admin action
      await this.logAdminAction('list_spaces', 'space', null, { filters, page, limit }, adminUser);

      // Get paginated spaces
      const result = await adminRepository.listSpaces(filters, page, limit);

      return formatAdminPaginatedResponse(result.docs, result, 'spaces');
    } catch (error) {
      logger.error('AdminService.listSpaces failed', {
        error: error.message,
        stack: error.stack,
        adminId: adminUser?._id,
      });
      throw new AppError('Failed to retrieve spaces', 500, error);
    }
  }

  /**
   * Suspend a user account
   * @param {string} userId - ID of the user to suspend
   * @param {Object} adminUser - Admin user performing the action
   * @param {string} reason - Reason for suspension
   * @returns {Promise<Object>} Result with success status and user data
   */
  async suspendUser(userId, adminUser, reason) {
    try {
      // Validate input
      if (!userId || !adminUser?._id) {
        throw new AppError('Invalid input parameters', 400);
      }

      // Prevent admins from suspending themselves
      if (userId === adminUser._id.toString()) {
        throw new AppError('You cannot suspend your own account', 400);
      }

      // Call repository to perform the suspension
      const user = await adminRepository.suspendUser(
        userId,
        adminUser._id,
        reason
      );

      // Log the admin action
      await this.logAdminAction('suspend_user', 'user', userId, { reason }, adminUser);

      // Format response with DTO
      return {
        success: true,
        message: 'User suspended successfully',
        data: formatAdminUserResponse(user)
      };
    } catch (error) {
      logger.error('AdminService.suspendUser failed', {
        error: error.message,
        stack: error.stack,
        adminId: adminUser?._id,
        userId
      });
      
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to suspend user', 500, error);
    }
  }

  /**
   * Reactivate a suspended user account
   * @param {string} userId - ID of the user to reactivate
   * @param {Object} adminUser - Admin user performing the action
   * @param {string} reason - Reason for reactivation
   * @returns {Promise<Object>} Result with success status and user data
   */
  async reactivateUser(userId, adminUser, reason = 'Admin reactivation') {
    try {
      // Validate input
      if (!userId || !adminUser?._id) {
        throw new AppError('Invalid input parameters', 400);
      }

      // Call repository to perform the reactivation
      const user = await adminRepository.reactivateUser(
        userId,
        adminUser._id,
        reason
      );

      // Log the admin action
      await this.logAdminAction('reactivate_user', 'user', userId, { reason }, adminUser);

      // Format response with DTO
      return {
        success: true,
        message: 'User reactivated successfully',
        data: formatAdminUserResponse(user)
      };
    } catch (error) {
      logger.error('AdminService.reactivateUser failed', {
        error: error.message,
        stack: error.stack,
        adminId: adminUser?._id,
        userId
      });
      
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to reactivate user', 500, error);
    }
  }

  /**
   * Approve a space listing
   * @param {string} spaceId - ID of the space to approve
   * @param {Object} adminUser - Admin user performing the action
   * @param {string} notes - Admin notes for approval
   * @returns {Promise<Object>} Result with success status and space data
   */
  async approveSpace(spaceId, adminUser, notes = '') {
    try {
      // Validate input
      if (!spaceId || !adminUser?._id) {
        throw new AppError('Invalid input parameters', 400);
      }

      // Call repository to perform the approval
      const space = await adminRepository.approveSpace(
        spaceId,
        adminUser._id,
        notes
      );

      // Release pending funds to host
      const hostId = space.hostId;
      
      // Find all paid bookings for this space with pending host payments
      const bookings = await Booking.find({
        spaceId,
        paymentStatus: 'paid',
        hostPaidOut: false
      });

      let totalReleased = 0;

      // Release pending balance for each booking
      for (const booking of bookings) {
        const walletTx = await WalletTransaction.findOne({
          bookingId: booking._id,
          category: 'host_earning',
          status: 'pending'
        });

        if (walletTx) {
          try {
            await walletService.releasePendingBalance(
              hostId,
              booking.hostEarnings,
              walletTx.reference
            );

            booking.hostPaidOut = true;
            booking.hostPaidOutAt = new Date();
            await booking.save();

            totalReleased += booking.hostEarnings;
          } catch (error) {
            logger.error('[Admin] Failed to release funds for booking', {
              bookingId: booking._id,
              error: error.message
            });
          }
        }
      }

      logger.info('[Admin] Space approved, funds released', {
        spaceId,
        hostId,
        bookingsCount: bookings.length,
        totalReleased
      });

      // Log the admin action
      await this.logAdminAction('approve_space', 'space', spaceId, { 
        notes, 
        fundsReleased: totalReleased,
        bookingsProcessed: bookings.length 
      }, adminUser);

      // Format response with DTO
      return {
        success: true,
        message: 'Space approved successfully',
        data: formatAdminSpaceResponse(space)
      };
    } catch (error) {
      logger.error('AdminService.approveSpace failed', {
        error: error.message,
        stack: error.stack,
        adminId: adminUser?._id,
        spaceId
      });
      
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to approve space', 500, error);
    }
  }

  /**
   * Reject a space listing
   * @param {string} spaceId - ID of the space to reject
   * @param {Object} adminUser - Admin user performing the action
   * @param {string} reason - Reason for rejection
   * @param {string} notes - Additional admin notes
   * @returns {Promise<Object>} Result with success status and space data
   */
  async rejectSpace(spaceId, adminUser, reason, notes = '') {
    try {
      // Validate input
      if (!spaceId || !adminUser?._id || !reason) {
        throw new AppError('Invalid input parameters', 400);
      }

      // Call repository to perform the rejection
      const space = await adminRepository.rejectSpace(
        spaceId,
        adminUser._id,
        reason,
        notes
      );

      // Log the admin action
      await this.logAdminAction('reject_space', 'space', spaceId, { reason, notes }, adminUser);

      // Format response with DTO
      return {
        success: true,
        message: 'Space rejected successfully',
        data: formatAdminSpaceResponse(space)
      };
    } catch (error) {
      logger.error('AdminService.rejectSpace failed', {
        error: error.message,
        stack: error.stack,
        adminId: adminUser?._id,
        spaceId
      });
      
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to reject space', 500, error);
    }
  }

  /**
   * Get admin action logs with pagination and filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @param {Object} adminUser - Admin user performing the action
   * @returns {Promise<Object>} Paginated action log results
   */
  async getActionLogs(filters = {}, pagination = {}, adminUser) {
    const { page = 1, limit = 50 } = pagination;

    try {
      // Log the admin action
      await this.logAdminAction('view_action_logs', 'admin_action', null, { filters, page, limit }, adminUser);

      // Get paginated action logs
      const result = await adminRepository.getActionLogs(filters, page, limit);

      return formatAdminPaginatedResponse(result.docs, result, 'actionLogs');
    } catch (error) {
      logger.error('AdminService.getActionLogs failed', {
        error: error.message,
        stack: error.stack,
        adminId: adminUser?._id,
      });
      throw new AppError('Failed to retrieve action logs', 500, error);
    }
  }

  /**
   * Get dashboard metrics for admin overview
   * @param {Object} adminUser - Admin user performing the action
   * @returns {Promise<Object>} Dashboard metrics
   */
  async getDashboardMetrics(adminUser) {
    try {
      // Log the admin action
      await this.logAdminAction('view_dashboard', 'dashboard', null, {}, adminUser);

      // Get dashboard metrics from repository
      const metrics = await adminRepository.getDashboardMetrics();

      // Format response with DTO
      return formatAdminDashboardMetricsResponse(metrics);
    } catch (error) {
      logger.error('AdminService.getDashboardMetrics failed', {
        error: error.message,
        stack: error.stack,
        adminId: adminUser?._id,
      });
      throw new AppError('Failed to retrieve dashboard metrics', 500, error);
    }
  }

  /**
   * Centralized admin action logging
   * @param {string} action - Action performed
   * @param {string} entityType - Type of entity affected
   * @param {string} entityId - ID of affected entity
   * @param {Object} metadata - Additional action metadata
   * @param {Object} adminUser - Admin user performing the action
   * @returns {Promise<Object>} Log entry
   */
  async logAdminAction(action, entityType, entityId, metadata = {}, adminUser) {
    try {
      const logEntry = {
        adminId: adminUser._id,
        action,
        entityType,
        entityId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: adminUser.userAgent || 'unknown',
          ipAddress: adminUser.ipAddress || 'unknown'
        }
      };

      return await adminRepository.logAdminAction(logEntry);
    } catch (error) {
      // Don't throw error for logging failures to avoid breaking main operation
      logger.warn('Failed to log admin action', {
        error: error.message,
        action,
        entityType,
        entityId,
        adminId: adminUser?._id
      });
      return null;
    }
  }

  /**
   * Get comprehensive admin statistics
   * @param {Object} adminUser - Admin user performing the action
   * @returns {Promise<Object>} Comprehensive statistics
   */
  async getAdminStatistics(adminUser) {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get various statistics
      const [
        totalActions,
        recentActions,
        userActions,
        spaceActions,
        bookingActions,
        topAdmins
      ] = await Promise.all([
        // Total admin actions
        adminRepository.getActionLogs({}, 1, 1).then(result => result.totalDocs || 0),
        
        // Recent actions (last 24 hours)
        adminRepository.getActionLogs({ startDate: last24Hours }, 1, 1000)
          .then(result => result.totalDocs || 0),
        
        // Actions by type in last week
        adminRepository.getActionLogs({ entityType: 'user', startDate: lastWeek }, 1, 1000)
          .then(result => result.totalDocs || 0),
        
        adminRepository.getActionLogs({ entityType: 'space', startDate: lastWeek }, 1, 1000)
          .then(result => result.totalDocs || 0),
        
        adminRepository.getActionLogs({ entityType: 'booking', startDate: lastWeek }, 1, 1000)
          .then(result => result.totalDocs || 0),
        
        // Top active admins
        adminRepository.getActionLogs({ startDate: lastMonth }, 1, 100)
          .then(result => {
            const adminCounts = {};
            result.docs.forEach(log => {
              const adminId = log.adminId.toString();
              adminCounts[adminId] = (adminCounts[adminId] || 0) + 1;
            });
            return Object.entries(adminCounts)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([adminId, count]) => ({ adminId, actionCount: count }));
          })
      ]);

      return {
        success: true,
        data: {
          overview: {
            totalActions,
            recentActions: recentActions,
            actionsLast24h: recentActions
          },
          actionBreakdown: {
            userActions: userActions,
            spaceActions: spaceActions,
            bookingActions: bookingActions
          },
          topAdmins: topAdmins,
          generatedAt: now.toISOString()
        }
      };
    } catch (error) {
      logger.error('AdminService.getAdminStatistics failed', {
        error: error.message,
        stack: error.stack,
        adminId: adminUser?._id,
      });
      throw new AppError('Failed to retrieve admin statistics', 500, error);
    }
  }
}

export default new AdminService();
