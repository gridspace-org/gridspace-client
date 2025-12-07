/**
 * Booking Controllers Index
 * 
 * Centralized export of all booking-related controllers.
 * Follows the modular architecture pattern for easy imports in route files.
 */

// User Booking Controllers
export { getUserBookings, getUserBookingsAdvanced } from './getUserBookings.controller.js';

// Host Booking Controllers  
export { 
  getHostBookings, 
  getHostBookingsStats, 
  getHostSpaceBookings 
} from './getHostBookings.controller.js';

// Booking Mutation Controllers (Phase 2)
export {
  createBooking,
  createBookingAdvanced,
  checkBookingAvailability
} from './createBooking.controller.js';

export {
  updateBookingStatus,
  confirmBooking,
  rejectBooking,
  getBookingStatusHistory
} from './updateBookingStatus.controller.js';

export {
  cancelBooking,
  getCancellationPolicy,
  calculateCancellationRefund,
  requestEmergencyCancellation
} from './cancelBooking.controller.js';

export { getBookingById } from './getBookingById.controller.js';

// Controller metadata for documentation and route registration
export const controllerMetadata = {
  name: 'bookingControllers',
  version: '1.0.0',
  description: 'Booking-related controllers following layered architecture',
  
  controllers: {
    // User Controllers
    getUserBookings: {
      method: 'GET',
      route: '/api/v1/bookings/me',
      description: 'Retrieve all bookings for the authenticated user',
      authRequired: true,
      role: 'user'
    },
    getUserBookingsAdvanced: {
      method: 'GET', 
      route: '/api/v1/bookings/me/advanced',
      description: 'Retrieve user bookings with advanced filtering',
      authRequired: true,
      role: 'user'
    },
    
    // Host Controllers
    getHostBookings: {
      method: 'GET',
      route: '/api/v1/host/bookings', 
      description: 'Retrieve all bookings for spaces owned by the host',
      authRequired: true,
      role: 'host'
    },
    getHostBookingsStats: {
      method: 'GET',
      route: '/api/v1/host/bookings/stats',
      description: 'Get aggregated booking statistics for host',
      authRequired: true,
      role: 'host'
    },
    getHostSpaceBookings: {
          method: 'GET',
          route: '/api/v1/host/bookings/space/:spaceId',
          description: 'Retrieve bookings for a specific host space',
          authRequired: true,
          role: 'host'
        },
    
        // Phase 2 - Create Booking Endpoints
        createBooking: {
          method: 'POST',
          route: '/api/v1/bookings',
          description: 'Create a new booking with conflict detection',
          authRequired: true,
          role: 'user'
        },
        createBookingAdvanced: {
          method: 'POST',
          route: '/api/v1/bookings/advanced',
          description: 'Create booking with advanced validation',
          authRequired: true,
          role: 'user'
        },
        checkBookingAvailability: {
          method: 'POST',
          route: '/api/v1/bookings/check-availability',
          description: 'Check if a time slot is available',
          authRequired: true,
          role: 'user'
        },
    
        // Phase 2 - Update Status Endpoints
        updateBookingStatus: {
          method: 'PUT',
          route: '/api/v1/bookings/:id/status',
          description: 'Update booking status (host action)',
          authRequired: true,
          role: 'host'
        },
        confirmBooking: {
          method: 'PUT',
          route: '/api/v1/bookings/:id/confirm',
          description: 'Quick endpoint to confirm pending booking',
          authRequired: true,
          role: 'host'
        },
        rejectBooking: {
          method: 'PUT',
          route: '/api/v1/bookings/:id/reject',
          description: 'Quick endpoint to reject pending booking',
          authRequired: true,
          role: 'host'
        },
        getBookingStatusHistory: {
          method: 'GET',
          route: '/api/v1/bookings/:id/status-history',
          description: 'Get booking status change history',
          authRequired: true,
          role: 'host'
        },
    
        // Phase 2 - Cancellation Endpoints
        cancelBooking: {
          method: 'DELETE',
          route: '/api/v1/bookings/:id',
          description: 'Cancel booking (user action)',
          authRequired: true,
          role: 'user'
        },
        getCancellationPolicy: {
          method: 'GET',
          route: '/api/v1/bookings/cancellation-policy',
          description: 'Get cancellation policy and refund rules',
          authRequired: true,
          role: 'user'
        },
        calculateCancellationRefund: {
          method: 'POST',
          route: '/api/v1/bookings/:id/calculate-refund',
          description: 'Calculate potential refund amount',
          authRequired: true,
          role: 'user'
        },
        requestEmergencyCancellation: {
          method: 'POST',
          route: '/api/v1/bookings/:id/emergency-cancellation',
          description: 'Request emergency cancellation',
          authRequired: true,
          role: 'user'
        }
      }
    };