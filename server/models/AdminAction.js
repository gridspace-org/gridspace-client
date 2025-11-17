import mongoose from 'mongoose';

const adminActionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  params: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  query: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive data before sending to client
      if (ret.requestBody && ret.requestBody.password) {
        delete ret.requestBody.password;
      }
      if (ret.requestBody && ret.requestBody.token) {
        delete ret.requestBody.token;
      }
      return ret;
    }
  }
});

// Index for faster querying
adminActionSchema.index({ adminId: 1, timestamp: -1 });
adminActionSchema.index({ action: 'text' });

// Add a static method to clean old logs
adminActionSchema.statics.cleanupOldLogs = async function(days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });
};

// Create a model using the schema
const AdminAction = mongoose.model('AdminAction', adminActionSchema);

export { AdminAction };
