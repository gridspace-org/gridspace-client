import Wallet from '../../models/Wallet.model.js';
import WalletTransaction from '../../models/WalletTransaction.model.js';
import AppError from '../../utils/AppError.js';
import logger from '../../config/logger.js';

class WalletService {
  async createWallet(userId) {
    try {
      const wallet = await Wallet.create({ userId });
      logger.info('[Wallet] Created', { userId, walletId: wallet._id });
      return wallet;
    } catch (error) {
      logger.error('[Wallet] Creation failed', { userId, error: error.message });
      throw new AppError('Failed to create wallet', 500);
    }
  }

  async getWallet(userId) {
    const wallet = await Wallet.findOne({ userId, isActive: true });
    if (!wallet) throw new AppError('Wallet not found', 404);
    return wallet;
  }

  async creditWallet(userId, amount, category, description, metadata = {}) {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) throw new AppError('Wallet not found', 404);

      const balanceBefore = wallet.availableBalance;
      wallet.availableBalance += amount;
      await wallet.save({ session });

      const reference = `WTX-${Date.now()}-${userId}`;
      await WalletTransaction.create([{
        walletId: wallet._id,
        userId,
        type: 'credit',
        category,
        amount,
        balanceBefore,
        balanceAfter: wallet.availableBalance,
        status: 'completed',
        reference,
        description,
        ...metadata
      }], { session });

      await session.commitTransaction();
      logger.info('[Wallet] Credited', { userId, amount, category });
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      logger.error('[Wallet] Credit failed', { userId, error: error.message });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async debitWallet(userId, amount, category, description, metadata = {}) {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) throw new AppError('Wallet not found', 404);
      if (wallet.availableBalance < amount) {
        throw new AppError('Insufficient balance', 400);
      }

      const balanceBefore = wallet.availableBalance;
      wallet.availableBalance -= amount;
      await wallet.save({ session });

      const reference = `WTX-${Date.now()}-${userId}`;
      await WalletTransaction.create([{
        walletId: wallet._id,
        userId,
        type: 'debit',
        category,
        amount,
        balanceBefore,
        balanceAfter: wallet.availableBalance,
        status: 'completed',
        reference,
        description,
        ...metadata
      }], { session });

      await session.commitTransaction();
      logger.info('[Wallet] Debited', { userId, amount, category });
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      logger.error('[Wallet] Debit failed', { userId, error: error.message });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addPendingBalance(userId, amount, category, description, metadata = {}) {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) throw new AppError('Wallet not found', 404);

      const balanceBefore = wallet.pendingBalance;
      wallet.pendingBalance += amount;
      await wallet.save({ session });

      const reference = `WTX-${Date.now()}-${userId}`;
      await WalletTransaction.create([{
        walletId: wallet._id,
        userId,
        type: 'credit',
        category,
        amount,
        balanceBefore,
        balanceAfter: wallet.pendingBalance,
        status: 'pending',
        reference,
        description,
        ...metadata
      }], { session });

      await session.commitTransaction();
      logger.info('[Wallet] Pending balance added', { userId, amount, category });
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      logger.error('[Wallet] Add pending failed', { userId, error: error.message });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async releasePendingBalance(userId, amount) {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) throw new AppError('Wallet not found', 404);
      if (wallet.pendingBalance < amount) {
        throw new AppError('Insufficient pending balance', 400);
      }

      wallet.pendingBalance -= amount;
      wallet.availableBalance += amount;
      await wallet.save({ session });

      await session.commitTransaction();
      logger.info('[Wallet] Pending balance released', { userId, amount });
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      logger.error('[Wallet] Release pending failed', { userId, error: error.message });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getTransactions(userId, options = {}) {
    const { page = 1, limit = 20, category, status } = options;
    
    const query = { userId };
    if (category) query.category = category;
    if (status) query.status = status;

    const transactions = await WalletTransaction.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: 'bookingId', select: 'spaceId startTime endTime totalAmount' }
    });

    return transactions;
  }
}

export default new WalletService();
