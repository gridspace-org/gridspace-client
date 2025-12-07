/**
 * @desc    Parse pagination parameters from request query
 * @param   {Object} query - Request query object
 * @returns {Object} Pagination options
 */
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

/**
 * @desc    Build pagination metadata for API responses
 * @param   {Object} options - Pagination options
 * @returns {Object} Pagination metadata
 */
const buildPaginationMeta = ({ 
  page, 
  limit, 
  totalDocs: totalItems, 
  totalPages, 
  hasNextPage, 
  hasPrevPage 
}) => ({
  page,
  limit,
  totalItems,
  totalPages,
  hasNextPage,
  hasPrevPage,
});

export { parsePagination, buildPaginationMeta };
