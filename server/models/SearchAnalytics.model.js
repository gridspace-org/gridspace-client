import mongoose from 'mongoose';

const searchAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: true
  },
  searchQuery: {
    type: String,
    trim: true
  },
  filters: {
    location: String,
    priceMin: Number,
    priceMax: Number,
    capacity: Number,
    purposes: [String],
    amenities: [String]
  },
  resultsCount: {
    type: Number,
    required: true
  },
  zeroResults: {
    type: Boolean,
    required: true
  },
  userAgent: String,
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient analytics queries
searchAnalyticsSchema.index({ timestamp: -1 });
searchAnalyticsSchema.index({ searchQuery: 1 });
searchAnalyticsSchema.index({ zeroResults: 1 });
searchAnalyticsSchema.index({ 'filters.location': 1 });

export default mongoose.model('SearchAnalytics', searchAnalyticsSchema);