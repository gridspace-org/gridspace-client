import Booking from '../models/Booking.model.js';
import User from '../models/User.model.js';
import Space from '../models/Space.model.js';
import AdminActionLog from '../models/AdminActionLog.model.js';
import AppError from '../utils/AppError.js';

class AdminRepository {
  /**
   * List all bookings with pagination and filtering
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated booking results
   */
  async listBookings(filters = {}, page = 1, limit = 10) {
    try {
      const options = {
        page,
        limit,
        sort: { startTime: -1 },
        populate: [
          { path: 'userId', select: 'fullname email role' },
          { path: 'spaceId', select: 'title location hostId' },
        ],
        lean: true,
      };

      return await Booking.paginate(filters, options);
    } catch (error) {
      throw new AppError('Failed to fetch bookings', 500, error);
    }
  }

  /**
   * Log admin action
   * @param {Object} logData - Action log data
   * @returns {Promise<Object>} Created log entry
   */
  async logAdminAction(logData) {
    try {
      return await AdminActionLog.create(logData);
    } catch (error) {
      // Don't throw error for logging failures to avoid breaking main operation
      console.error('Failed to log admin action:', error);
      return null;
    }
  }

  /**
   * List all users with pagination and filtering
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated user results
   */
  async listUsers(filters = {}, page = 1, limit = 20) {
    try {
      const options = {
        page,
        limit,
        sort: { createdAt: -1 },
        select: '-password -refreshToken -resetPasswordToken -resetPasswordExpire',
        lean: true,
      };

      // Build filter query
      const query = {};
      
      if (filters.role) {
        query.role = filters.role;
      }
      
      if (filters.search) {
        query.$or = [
          { email: { $regex: filters.search, $options: 'i' } },
          { fullname: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === 'true';
      }

      if (filters.isEmailVerified !== undefined) {
        query.isEmailVerified = filters.isEmailVerified === 'true';
      }

      return await User.paginate(query, options);
    } catch (error) {
      throw new AppError('Failed to fetch users', 500, error);
    }
  }

  /**
   * List all spaces with pagination and filtering
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated space results
   */
  async listSpaces(filters = {}, page = 1, limit = 20) {
    try {
      const options = {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: [
          { path: 'hostId', select: 'fullname email' },
        ],
        lean: true,
      };

      // Build filter query
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { 'location.address': { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.hostId) {
        query.hostId = filters.hostId;
      }

      if (filters.minPrice || filters.maxPrice) {
        query.pricePerHour = {};
        if (filters.minPrice) query.pricePerHour.$gte = Number(filters.minPrice);
        if (filters.maxPrice) query.pricePerHour.$lte = Number(filters.maxPrice);
      }

      if (filters.capacity) {
        query.capacity = { $gte: Number(filters.capacity) };
      }

      return await Space.paginate(query, options);
    } catch (error) {
      throw new AppError('Failed to fetch spaces', 500, error);
    }
  }

  /**
   * Suspend a user account
   * @param {string} userId - ID of the user to suspend
   * @param {string} adminId - ID of the admin performing the action
   * @param {string} reason - Reason for suspension
   * @returns {Promise<Object>} Updated user object
   */
  async suspendUser(userId, adminId, reason) {
    try {
      // Check if user exists and is not already suspended
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      if (!user.isActive) {
        throw new AppError('User is already suspended', 400);
      }

      // Update user status
      user.isActive = false;
      user.suspendedAt = new Date();
      user.suspendedBy = adminId;
      user.suspensionReason = reason;
      
      await user.save({ validateBeforeSave: false });

      // Log the admin action
      await this.logAdminAction({
        adminId,
        action: 'suspend_user',
        entityType: 'user',
        entityId: userId,
        metadata: {
          reason,
          previousStatus: 'active',
          newStatus: 'suspended'
        }
      });

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to suspend user', 500, error);
    }
  }

  /**
   * Reactivate a suspended user account
   * @param {string} userId - ID of the user to reactivate
   * @param {string} adminId - ID of the admin performing the action
   * @param {string} reason - Reason for reactivation
   * @returns {Promise<Object>} Updated user object
   */
  async reactivateUser(userId, adminId, reason = 'Admin reactivation') {
    try {
      // Check if user exists and is suspended
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      if (user.isActive) {
        throw new AppError('User is already active', 400);
      }

      // Update user status
      user.isActive = true;
      user.reactivatedAt = new Date();
      user.reactivatedBy = adminId;
      user.reactivationReason = reason;
      // Clear suspension info
      user.suspendedAt = null;
      user.suspendedBy = null;
      user.suspensionReason = null;
      
      await user.save({ validateBeforeSave: false });

      // Log the admin action
      await this.logAdminAction({
        adminId,
        action: 'reactivate_user',
        entityType: 'user',
        entityId: userId,
        metadata: {
          reason,
          previousStatus: 'suspended',
          newStatus: 'active'
        }
      });

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to reactivate user', 500, error);
    }
  }

  /**
   * Approve a space listing
   * @param {string} spaceId - ID of the space to approve
   * @param {string} adminId - ID of the admin performing the action
   * @param {string} notes - Admin notes for approval
   * @returns {Promise<Object>} Updated space object
   */
  async approveSpace(spaceId, adminId, notes = '') {
    try {
      // Check if space exists and is pending
      const space = await Space.findById(spaceId);
      if (!space) {
        throw new AppError('Space not found', 404);
      }
      
      if (space.status !== 'pending') {
        throw new AppError(`Space is already ${space.status}`, 400);
      }

      // Update space status
      space.status = 'approved';
      space.approvedAt = new Date();
      space.approvedBy = adminId;
      space.approvalNotes = notes;
      
      await space.save({ validateBeforeSave: false });

      // Log the admin action
      await this.logAdminAction({
        adminId,
        action: 'approve_space',
        entityType: 'space',
        entityId: spaceId,
        metadata: {
          notes,
          previousStatus: 'pending',
          newStatus: 'approved'
        }
      });

      return space;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to approve space', 500, error);
    }
  }

  /**
   * Reject a space listing
   * @param {string} spaceId - ID of the space to reject
   * @param {string} adminId - ID of the admin performing the action
   * @param {string} reason - Reason for rejection
   * @param {string} notes - Additional admin notes
   * @returns {Promise<Object>} Updated space object
   */
  async rejectSpace(spaceId, adminId, reason, notes = '') {
    try {
      // Check if space exists and is pending
      const space = await Space.findById(spaceId);
      if (!space) {
        throw new AppError('Space not found', 404);
      }
      
      if (space.status !== 'pending') {
        throw new AppError(`Space is already ${space.status}`, 400);
      }

      // Validate reason is provided
      if (!reason || reason.trim() === '') {
        throw new AppError('Rejection reason is required', 400);
      }

      // Update space status
      space.status = 'rejected';
      space.rejectedAt = new Date();
      space.rejectedBy = adminId;
      space.rejectionReason = reason;
      space.rejectionNotes = notes;
      
      await space.save({ validateBeforeSave: false });

      // Log the admin action
      await this.logAdminAction({
        adminId,
        action: 'reject_space',
        entityType: 'space',
        entityId: spaceId,
        metadata: {
          reason,
          notes,
          previousStatus: 'pending',
          newStatus: 'rejected'
        }
      });

      return space;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to reject space', 500, error);
    }
  }

  /**
   * Get admin action logs with pagination and filtering
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated action log results
   */
  async getActionLogs(filters = {}, page = 1, limit = 50) {
    try {
      const options = {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: [
          { path: 'adminId', select: 'fullname email role' },
        ],
        lean: true,
      };

      // Build filter query
      const query = {};
      
      if (filters.action) {
        query.action = filters.action;
      }
      
      if (filters.entityType) {
        query.entityType = filters.entityType;
      }

      if (filters.adminId) {
        query.adminId = filters.adminId;
      }

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      return await AdminActionLog.paginate(query, options);
    } catch (error) {
      throw new AppError('Failed to fetch action logs', 500, error);
    }
  }

  /**
   * Get dashboard metrics for admin overview
   * @returns {Promise<Object>} Dashboard metrics
   */
  async getDashboardMetrics() {
    try {
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Parallel execution for better performance
      const [
        totalUsers,
        activeUsers,
        totalSpaces,
        activeSpaces,
        pendingSpaces,
        totalBookings,
        usersByRole,
        spacesByStatus,
        bookingsByStatus,
        recentUsers,
        recentSpaces,
        recentBookings,
        monthlyRevenue,
        actionLogsLast7Days
      ] = await Promise.all([
        // User counts
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        
        // Space counts
        Space.countDocuments(),
        Space.countDocuments({ status: 'approved', isActive: true }),
        Space.countDocuments({ status: 'pending' }),
        
        // Booking counts
        Booking.countDocuments(),
        
        // User metrics
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        
        // Space metrics
        Space.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        
        // Booking metrics
        Booking.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        
        // Recent activity (last 7 days)
        User.countDocuments({ createdAt: { $gte: last7Days } }),
        Space.countDocuments({ createdAt: { $gte: last7Days } }),
        Booking.countDocuments({ createdAt: { $gte: last7Days } }),
        
        // Revenue metrics
        Booking.aggregate([
          {
            $match: {
              createdAt: { $gte: last30Days },
              paymentStatus: 'paid'
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              revenue: { $sum: '$totalAmount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),
        
        // Recent admin actions
        AdminActionLog.countDocuments({ createdAt: { $gte: last7Days } })
      ]);

      // Transform aggregation results
      const usersByRoleObj = {};
      usersByRole.forEach(item => {
        usersByRoleObj[item._id] = item.count;
      });

      const spacesByStatusObj = {};
      spacesByStatus.forEach(item => {
        spacesByStatusObj[item._id] = item.count;
      });

      const bookingsByStatusObj = {};
      bookingsByStatus.forEach(item => {
        bookingsByStatusObj[item._id] = item.count;
      });

      // Calculate total revenue
      const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
      
      return {
        totalUsers,
        activeUsers,
        totalSpaces,
        activeSpaces,
        pendingSpaces,
        totalBookings,
        usersByRole: usersByRoleObj,
        spacesByStatus: spacesByStatusObj,
        bookingsByStatus: bookingsByStatusObj,
        recentUserRegistrations: recentUsers,
        recentSpaceCreations: recentSpaces,
        recentBookingCreations: recentBookings,
        monthlyRevenue,
        totalRevenue,
        actionLogsLast7Days,
        generatedAt: now
      };
    } catch (error) {
      throw new AppError('Failed to fetch dashboard metrics', 500, error);
    }
  }
}

export default new AdminRepository();
