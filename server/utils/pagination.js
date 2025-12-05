/**
 * Centralized pagination utility
 * Enforces max limits to prevent resource exhaustion attacks
 *
 * @module utils/pagination
 */

/**
 * Parse and validate pagination parameters
 * @param {Object} query - Request query params or options object
 * @param {number} defaultLimit - Default items per page (default: 10)
 * @param {number} maxLimit - Maximum allowed limit (default: 100)
 * @returns {Object} Validated pagination params { page, limit }
 *
 * @example
 * const { page, limit } = getPaginationParams(req.query, 10, 50);
 * // User requests ?limit=999999 -> returns { page: 1, limit: 50 }
 */
export const getPaginationParams = (
  query = {},
  defaultLimit = 10,
  maxLimit = 100
) => {
  // Parse page - ensure it's at least 1
  const page = Math.max(1, parseInt(query.page) || 1);

  // Parse limit - ensure it's between 1 and maxLimit
  const requestedLimit = parseInt(query.limit) || defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, requestedLimit));

  return { page, limit };
};

/**
 * Calculate skip value for database queries
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {number} Number of documents to skip
 *
 * @example
 * const skip = getSkipValue(3, 20);
 * // Returns: 40 (skip first 2 pages of 20 items each)
 */
export const getSkipValue = (page, limit) => {
  return (page - 1) * limit;
};

/**
 * Create pagination metadata for API responses
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalDocs - Total number of documents
 * @returns {Object} Pagination metadata
 *
 * @example
 * const meta = getPaginationMeta(2, 20, 95);
 * // Returns: { page: 2, limit: 20, totalPages: 5, totalDocs: 95, hasNextPage: true, hasPrevPage: true }
 */
export const getPaginationMeta = (page, limit, totalDocs) => {
  const totalPages = Math.ceil(totalDocs / limit);

  return {
    page,
    limit,
    totalPages,
    totalDocs,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export default {
  getPaginationParams,
  getSkipValue,
  getPaginationMeta,
};
