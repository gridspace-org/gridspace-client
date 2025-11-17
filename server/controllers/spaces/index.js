/**
 * Spaces Module Controller Exports
 * 
 * Centralized exports for all space-related controllers following the layered architecture pattern.
 * Controllers → Services → Repositories pattern implemented throughout.
 */

// Import all controller functions
import {
  createSpace,
  createSpaceAdvanced,
  uploadSpaceImages,
  validateSpaceDataController
} from './createSpace.controller.js';

import {
  searchSpaces,
  getPopularSpaces,
  getSpaceStatistics,
  checkSpaceAvailability,
  advancedSpaceSearch
} from './searchSpaces.controller.js';

import {
  getSpaceDetails,
  updateSpace,
  deleteSpace,
  getHostSpaces,
  getHostSpaceAnalytics,
  toggleSpaceStatus
} from './manageSpaces.controller.js';

// Export all controller functions
export {
  // Create Space Controllers
  createSpace,
  createSpaceAdvanced,
  uploadSpaceImages,
  validateSpaceDataController,
  
  // Search Space Controllers
  searchSpaces,
  getPopularSpaces,
  getSpaceStatistics,
  checkSpaceAvailability,
  advancedSpaceSearch,
  
  // Space Management Controllers
  getSpaceDetails,
  updateSpace,
  deleteSpace,
  getHostSpaces,
  getHostSpaceAnalytics,
  toggleSpaceStatus
};

/**
 * Space Endpoints Metadata
 * 
 * Complete documentation of all space-related API endpoints.
 * Useful for route configuration and API documentation.
 */
export const spaceEndpoints = {
  // Creation Endpoints
  createSpace: {
    method: 'POST',
    route: '/api/v1/spaces',
    description: 'Create a new space with image upload',
    authRequired: true,
    role: 'host',
    middleware: ['auth', 'validateSpace', 'uploadImages']
  },
  createSpaceAdvanced: {
    method: 'POST',
    route: '/api/v1/spaces/advanced',
    description: 'Create space with advanced validation and features',
    authRequired: true,
    role: 'host',
    middleware: ['auth', 'validateSpaceAdvanced', 'uploadImages']
  },
  uploadSpaceImages: {
    method: 'POST',
    route: '/api/v1/spaces/upload-images',
    description: 'Upload additional images to existing space',
    authRequired: true,
    role: 'host',
    middleware: ['auth', 'validateSpaceId', 'uploadImages']
  },
  validateSpaceData: {
    method: 'POST',
    route: '/api/v1/spaces/validate',
    description: 'Validate space data without creating',
    authRequired: true,
    role: 'host',
    middleware: ['auth', 'validateSpaceDataOnly']
  },

  // Search Endpoints
  searchSpaces: {
    method: 'GET',
    route: '/api/v1/spaces',
    description: 'Search spaces with filters and pagination',
    authRequired: false,
    middleware: ['validateSearchParams']
  },
  getPopularSpaces: {
    method: 'GET',
    route: '/api/v1/spaces/popular',
    description: 'Get popular spaces based on various criteria',
    authRequired: false,
    middleware: []
  },
  getSpaceStatistics: {
    method: 'GET',
    route: '/api/v1/spaces/statistics',
    description: 'Get aggregated space statistics',
    authRequired: false,
    middleware: []
  },
  checkSpaceAvailability: {
    method: 'POST',
    route: '/api/v1/spaces/check-availability',
    description: 'Check if space is available for specific time period',
    authRequired: true,
    middleware: ['auth', 'validateTimeSlot']
  },
  advancedSpaceSearch: {
    method: 'POST',
    route: '/api/v1/spaces/advanced-search',
    description: 'Advanced search with complex filters and availability',
    authRequired: false,
    middleware: ['validateAdvancedSearch']
  },

  // Management Endpoints
  getSpaceDetails: {
    method: 'GET',
    route: '/api/v1/spaces/:id',
    description: 'Get detailed information about specific space',
    authRequired: false,
    middleware: ['validateSpaceId']
  },
  updateSpace: {
    method: 'PUT',
    route: '/api/v1/spaces/:id',
    description: 'Update space information (owner only)',
    authRequired: true,
    role: 'host',
    middleware: ['auth', 'validateSpaceId', 'validateSpaceOwnership', 'uploadImages']
  },
  deleteSpace: {
    method: 'DELETE',
    route: '/api/v1/spaces/:id',
    description: 'Soft delete space (owner only)',
    authRequired: true,
    role: 'host',
    middleware: ['auth', 'validateSpaceId', 'validateSpaceOwnership']
  },
  getHostSpaces: {
    method: 'GET',
    route: '/api/v1/host/spaces',
    description: 'Get all spaces for authenticated host',
    authRequired: true,
    role: 'host',
    middleware: ['auth', 'validatePagination']
  },
  getHostSpaceAnalytics: {
    method: 'GET',
    route: '/api/v1/host/spaces/analytics',
    description: 'Get analytics for host spaces',
    authRequired: true,
    role: 'host',
    middleware: ['auth', 'validateTimeRange']
  },
  toggleSpaceStatus: {
    method: 'PATCH',
    route: '/api/v1/spaces/:id/toggle-status',
    description: 'Activate/deactivate space (owner only)',
    authRequired: true,
    role: 'host',
    middleware: ['auth', 'validateSpaceId', 'validateSpaceOwnership']
  }
};

/**
 * Controller Layer Summary
 * 
 * Phase 3: Spaces Module Refactor - COMPLETE ✅
 * 
 * All space-related functionality has been refactored following the same layered architecture pattern:
 * 
 * ✅ **REPOSITORY LAYER**: space.repository.js
 *    - Complete CRUD operations for spaces
 *    - Search and filtering capabilities
 *    - Analytics logging
 *    - Geographic search (future ready)
 * 
 * ✅ **SERVICE LAYER**: space.service.js
 *    - Business logic separation
 *    - Image upload handling
 *    - Availability checking
 *    - Data validation
 *    - Error handling
 * 
 * ✅ **CONTROLLER LAYER**: Individual controller files
 *    - createSpace.controller.js: Space creation and validation
 *    - searchSpaces.controller.js: Advanced search and filtering
 *    - manageSpaces.controller.js: CRUD operations and management
 * 
 * ✅ **DTO FORMATTERS**: space.dto.js
 *    - Standardized response formatting
 *    - Error response consistency
 *    - Data validation helpers
 * 
 * Architecture Benefits:
 * - Controllers handle HTTP concerns only
 * - Services contain business logic
 * - Repositories manage database operations
 * - DTOs ensure consistent API responses
 * - Clean separation of concerns
 * - Testable and maintainable code
 * 
 * Ready for Phase 4: Cross-Cutting Enhancements
 */
export default {
  controllers: {
    createSpace,
    createSpaceAdvanced,
    uploadSpaceImages,
    validateSpaceDataController,
    searchSpaces,
    getPopularSpaces,
    getSpaceStatistics,
    checkSpaceAvailability,
    advancedSpaceSearch,
    getSpaceDetails,
    updateSpace,
    deleteSpace,
    getHostSpaces,
    getHostSpaceAnalytics,
    toggleSpaceStatus
  },
  endpoints: spaceEndpoints,
  architecture: {
    layer: 'Controller',
    pattern: 'Controllers → Services → Repositories',
    phase: 'Phase 3: Spaces Module Refactor',
    status: 'Complete'
  }
};