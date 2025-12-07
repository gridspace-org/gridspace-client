import walletService from '../../services/wallet/wallet.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, status } = req.query;

  const result = await walletService.getTransactions(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
    category,
    status
  });

  res.status(200).json({
    success: true,
    message: 'Transactions retrieved successfully',
    data: {
      transactions: result.docs,
      pagination: {
        total: result.totalDocs,
        page: result.page,
        pages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    }
  });
});
