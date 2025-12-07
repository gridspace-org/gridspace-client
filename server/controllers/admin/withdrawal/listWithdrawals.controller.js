import Withdrawal from '../../../models/Withdrawal.model.js';
import asyncHandler from '../../../utils/asyncHandler.js';

export const listWithdrawals = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const result = await Withdrawal.paginate(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: { path: 'userId', select: 'fullname email' }
  });

  res.status(200).json({
    success: true,
    message: 'Withdrawals retrieved successfully',
    data: {
      withdrawals: result.docs,
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
