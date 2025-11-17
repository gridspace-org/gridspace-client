import mongoose from 'mongoose';
import env from '../config/env.js';

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  availableBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  currency: {
    type: String,
    default: env.wallet.currency,
    enum: ['NGN']
  },
  
  dailyWithdrawalLimit: {
    type: Number,
    default: env.wallet.dailyWithdrawalLimit
  },
  monthlyWithdrawalLimit: {
    type: Number,
    default: env.wallet.monthlyWithdrawalLimit
  },
  
  bankAccount: {
    accountNumber: String,
    accountName: String,
    bankName: String,
    bankCode: String
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

walletSchema.virtual('totalBalance').get(function() {
  return this.availableBalance + this.pendingBalance;
});

walletSchema.index({ isActive: 1 });

walletSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Wallet', walletSchema);
