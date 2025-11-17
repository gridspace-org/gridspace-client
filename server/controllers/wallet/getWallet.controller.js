import walletService from '../../services/wallet/wallet.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWallet(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Wallet retrieved successfully',
    data: {
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      totalBalance: wallet.totalBalance,
      currency: wallet.currency,
      dailyWithdrawalLimit: wallet.dailyWithdrawalLimit,
      monthlyWithdrawalLimit: wallet.monthlyWithdrawalLimit
    }
  });
});
