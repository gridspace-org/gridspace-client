import walletService from '../../services/wallet/wallet.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const deposit = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const userId = req.user._id;

  const result = await walletService.initiateDeposit(userId, amount, description);

  res.status(200).json({
    success: true,
    message: 'Deposit initialized successfully',
    data: result
  });
});
