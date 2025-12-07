import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  paymentReference: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  transactionReference: {
    type: String,
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
    index: true
  },
  
  paymentMethod: String,
  paymentDate: Date,
  verifiedAt: Date,
  
  checkoutUrl: String,
  customerEmail: String,
  customerName: String,
  
  webhookReceived: {
    type: Boolean,
    default: false
  },
  webhookData: mongoose.Schema.Types.Mixed
}, { timestamps: true });

transactionSchema.index({ userId: 1, status: 1 });
// bookingId index removed - already defined with index: true in field definition

export default mongoose.model('Transaction', transactionSchema);
