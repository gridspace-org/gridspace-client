import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true
  },
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space",
    required: [true, "Space ID is required"],
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: [true, "Booking ID is required"]
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"],
    validate: {
      validator: Number.isInteger,
      message: "Rating must be a whole number"
    }
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, "Comment cannot exceed 1000 characters"]
  },
  // Nigerian context - specific aspects to rate
  aspects: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      validate: Number.isInteger
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5,
      validate: Number.isInteger
    },
    value: {
      type: Number,
      min: 1,
      max: 5,
      validate: Number.isInteger
    }
  },
  hostResponse: {
    text: {
      type: String,
      trim: true,
      maxlength: [500, "Host response cannot exceed 500 characters"]
    },
    respondedAt: {
      type: Date
    }
  },
  isRecommended: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
reviewSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index to ensure one review per user per space
reviewSchema.index({ userId: 1, spaceId: 1 }, { unique: true });

// Indexes for efficient querying
reviewSchema.index({ spaceId: 1, rating: 1 });
reviewSchema.index({ spaceId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted rating (e.g., 4.5 stars)
reviewSchema.virtual("averageAspectRating").get(function() {
  if (this.aspects && Object.values(this.aspects).every(val => val !== undefined)) {
    const values = Object.values(this.aspects);
    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  }
  return this.rating;
});

// Ensure virtual fields are serialized
reviewSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Review", reviewSchema);