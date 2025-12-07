import { format, parseISO } from 'date-fns';

/**
 * Admin User Data Transfer Objects
 * Standardizes admin responses for consistency
 */

/**
 * Format user data for admin listing responses
 * @param {Object} user - User object from database
 * @returns {Object} Formatted user data
 */
export const formatAdminUserResponse = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
    phonenumber: user.phonenumber,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    onboardingCompleted: user.onboardingCompleted,
    profilePic: user.profilePic,
    
    // Suspension information (only if suspended)
    suspension: user.isActive ? null : {
      isSuspended: true,
      reason: user.suspensionReason,
      suspendedAt: user.suspendedAt,
      suspendedBy: user.suspendedBy
    },
    
    // Metadata
    createdAt: user.createdAt,
    lastActive: user.lastActive,
    
    // Computed fields
    accountAge: calculateAccountAge(user.createdAt),
    status: user.isActive ? 'active' : 'suspended',
    verificationStatus: user.emailVerified ? 'verified' : 'pending'
  };
};

/**
 * Format space data for admin listing responses
 * @param {Object} space - Space object from database
 * @returns {Object} Formatted space data
 */
export const formatAdminSpaceResponse = (space) => {
  if (!space) return null;

  return {
    _id: space._id,
    title: space.title,
    description: space.description,
    location: space.location,
    pricePerHour: space.pricePerHour,
    capacity: space.capacity,
    status: space.status,
    isActive: space.isActive,
    amenities: space.amenities,
    images: space.images,
    
    // Host information (populated)
    host: space.hostId ? {
      _id: space.hostId._id || space.hostId,
      fullname: space.hostId.fullname,
      email: space.hostId.email,
      role: space.hostId.role
    } : null,
    
    // Approval information
    approval: space.status !== 'pending' ? {
      approvedAt: space.approvedAt,
      approvedBy: space.approvedBy,
      rejectionReason: space.rejectionReason,
      rejectedAt: space.rejectedAt
    } : null,
    
    // Metadata
    createdAt: space.createdAt,
    updatedAt: space.updatedAt,
    
    // Computed fields
    ageInDays: calculateAccountAge(space.createdAt),
    spaceStatus: space.status
  };
};

/**
 * Format booking data for admin listing responses
 * @param {Object} booking - Booking object from database
 * @returns {Object} Formatted booking data
 */
export const formatAdminBookingResponse = (booking) => {
  if (!booking) return null;

  return {
    _id: booking._id,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    totalAmount: booking.totalAmount,
    guestCount: booking.guestCount,
    specialRequests: booking.specialRequests,
    
    // User information (populated)
    user: booking.userId ? {
      _id: booking.userId._id || booking.userId,
      fullname: booking.userId.fullname,
      email: booking.userId.email,
      role: booking.userId.role
    } : null,
    
    // Space information (populated)
    space: booking.spaceId ? {
      _id: booking.spaceId._id || booking.spaceId,
      title: booking.spaceId.title,
      location: booking.spaceId.location,
      hostId: booking.spaceId.hostId
    } : null,
    
    // Time information
    startTime: booking.startTime,
    endTime: booking.endTime,
    duration: booking.duration,
    
    // Cancellation information (if applicable)
    cancellationInfo: booking.status === 'cancelled' ? booking.cancellationInfo : null,
    
    // Metadata
    createdAt: booking.createdAt,
    
    // Computed fields
    bookingAge: calculateAccountAge(booking.createdAt),
    timeUntilStart: getTimeUntilStart(booking.startTime),
    bookingStatus: booking.status
  };
};

/**
 * Format admin action log response
 * @param {Object} actionLog - Action log object
 * @returns {Object} Formatted action log data
 */
export const formatAdminActionLogResponse = (actionLog) => {
  if (!actionLog) return null;

  return {
    _id: actionLog._id,
    action: actionLog.action,
    entityType: actionLog.entityType,
    entityId: actionLog.entityId,
    adminId: actionLog.adminId,
    metadata: actionLog.metadata,
    createdAt: actionLog.createdAt
  };
};

/**
 * Format admin dashboard metrics response
 * @param {Object} metrics - Raw metrics data
 * @returns {Object} Formatted metrics data
 */
export const formatAdminDashboardMetricsResponse = (metrics) => {
  return {
    overview: {
      totalUsers: metrics.totalUsers || 0,
      totalSpaces: metrics.totalSpaces || 0,
      totalBookings: metrics.totalBookings || 0,
      activeUsers: metrics.activeUsers || 0,
      activeSpaces: metrics.activeSpaces || 0,
      pendingSpaces: metrics.pendingSpaces || 0,
      totalRevenue: metrics.totalRevenue || 0
    },
    
    userMetrics: {
      usersByRole: metrics.usersByRole || {},
      usersByStatus: metrics.usersByStatus || {},
      recentUserRegistrations: metrics.recentUserRegistrations || []
    },
    
    spaceMetrics: {
      spacesByStatus: metrics.spacesByStatus || {},
      averagePricePerHour: metrics.averagePricePerHour || 0,
      mostPopularAmenities: metrics.mostPopularAmenities || []
    },
    
    bookingMetrics: {
      bookingsByStatus: metrics.bookingsByStatus || {},
      bookingsByMonth: metrics.bookingsByMonth || [],
      averageBookingValue: metrics.averageBookingValue || 0,
      conversionRate: metrics.conversionRate || 0
    },
    
    financialMetrics: {
      monthlyRevenue: metrics.monthlyRevenue || [],
      revenueBySpace: metrics.revenueBySpace || [],
      refundRate: metrics.refundRate || 0
    },
    
    systemHealth: {
      activeConnections: metrics.activeConnections || 0,
      systemUptime: metrics.systemUptime || '0h',
      lastBackupTime: metrics.lastBackupTime,
      errorRate: metrics.errorRate || 0
    },
    
    generatedAt: new Date().toISOString()
  };
};

/**
 * Utility function to calculate account age in days
 * @param {Date|string} createdAt - Creation date
 * @returns {number} Age in days
 */
const calculateAccountAge = (createdAt) => {
  if (!createdAt) return 0;
  
  const created = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt;
  const now = new Date();
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Utility function to get time until booking start
 * @param {Date|string} startTime - Booking start time
 * @returns {Object} Time remaining information
 */
const getTimeUntilStart = (startTime) => {
  if (!startTime) return null;
  
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const now = new Date();
  const diffTime = start - now;
  
  if (diffTime <= 0) {
    return {
      status: 'started',
      message: 'Booking has started',
      timeRemaining: 0
    };
  }
  
  const hours = Math.floor(diffTime / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return {
    status: 'upcoming',
    daysUntilStart: days,
    hoursUntilStart: remainingHours,
    totalHoursUntilStart: Math.floor(diffTime / (1000 * 60 * 60)),
    formatted: days > 0 ? `${days}d ${remainingHours}h` : `${remainingHours}h`
  };
};

/**
 * Format paginated response wrapper
 * @param {Array} data - Array of formatted items
 * @param {Object} pagination - Pagination metadata
 * @param {string} entityType - Type of entity being paginated
 * @returns {Object} Standardized paginated response
 */
export const formatAdminPaginatedResponse = (data, pagination, entityType = 'items') => {
  const formatterMap = {
    users: formatAdminUserResponse,
    spaces: formatAdminSpaceResponse,
    bookings: formatAdminBookingResponse,
    actionLogs: formatAdminActionLogResponse
  };
  
  const formatter = formatterMap[entityType] || ((item) => item);
  
  return {
    success: true,
    data: data.map(formatter),
    pagination: {
      total: pagination.totalDocs || pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalPages: pagination.totalPages || Math.ceil((pagination.totalDocs || pagination.total || 0) / (pagination.limit || 10)),
      hasNext: pagination.hasNextPage || false,
      hasPrev: pagination.hasPrevPage || false
    },
    summary: {
      entityType,
      formattedAt: new Date().toISOString()
    }
  };
};