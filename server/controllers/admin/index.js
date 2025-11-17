/**
 * Admin Controllers
 *
 * This file serves as the entry point for all admin-related controllers.
 * It exports all admin controller functions for use in routes.
 */

// Import user controllers
import listUsers from './users/listUsers.js';
import suspendUser from './users/suspendUser.js';
import reactivateUser from './users/reactivateUser.js';

// Import space controllers
import listSpaces from './spaces/listSpaces.js';
import approveSpace from './spaces/approveSpace.js';
import rejectSpace from './spaces/rejectSpace.js';

// Import booking controllers
import listBookings from './bookings/listBookings.js';

// Import dashboard controllers
import {
  getDashboardMetrics,
  getAdminStatistics,
  getActionLogs
} from './dashboard.controller.js';

// Export all controller functions
export {
  // User management
  listUsers,
  suspendUser,
  reactivateUser,
  
  // Space management
  listSpaces,
  approveSpace,
  rejectSpace,
  
  // Booking management
  listBookings,
  
  // Dashboard management
  getDashboardMetrics,
  getAdminStatistics,
  getActionLogs
};

// Default export for easier imports
export default {
  // User management
  listUsers,
  suspendUser,
  reactivateUser,
  
  // Space management
  listSpaces,
  approveSpace,
  rejectSpace,
  
  // Booking management
  listBookings,
  
  // Dashboard management
  getDashboardMetrics,
  getAdminStatistics,
  getActionLogs
};
