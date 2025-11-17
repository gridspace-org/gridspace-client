import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const walletTransactionSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  
  category: {
    type: String,
    enum: ['booking_payment', 'host_earning', 'platform_fee', 'withdrawal', 'refund', 'deposit'],
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  
  reference: {
    type: String,
    required: true,
    unique: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

walletTransactionSchema.plugin(mongoosePaginate);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ category: 1, status: 1 });

export default mongoose.model('WalletTransaction', walletTransactionSchema);
