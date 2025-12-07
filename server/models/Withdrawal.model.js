import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 500
  },
  
  bankAccount: {
    accountNumber: {
      type: String,
      required: true
    },
    accountName: {
      type: String,
      required: true
    },
    bankName: {
      type: String,
      required: true
    },
    bankCode: String
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  reference: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  
  transactionReference: String,
  paymentProof: String,
  
  notes: String,
  failureReason: String
}, { timestamps: true });

withdrawalSchema.plugin(mongoosePaginate);

withdrawalSchema.index({ userId: 1, status: 1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Withdrawal', withdrawalSchema);
