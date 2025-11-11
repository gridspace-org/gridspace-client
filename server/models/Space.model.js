import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const spaceSchema = new mongoose.Schema({
  // ===== CORE RELATIONSHIPS =====
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Host ID is required"],
    index: true // Faster queries for host's spaces
  },

  // ===== SPACE DETAILS =====
  title: {
    type: String,
    required: [true, "Space title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    required: [true, "Space description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },

  // ===== LOCATION =====
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },

  // ===== PRICING =====
  pricePerHour: {
    type: Number,
    required: [true, "Price per hour is required"],
    min: [500, "Minimum price per hour is ₦500"],
    max: [50000, "Maximum price per hour is ₦50,000"]
  },
  pricePerDay: {
    type: Number,
    min: [500, "Minimum price per day is ₦500"],
    max: [500000, "Maximum price per day is ₦500,000"]
  },
  pricePerWeek: {
    type: Number,
    min: [500, "Minimum price per week is ₦500"],
    max: [2000000, "Maximum price per week is ₦2,000,000"]
  },

  // ===== MEDIA =====
  images: {
    type: [String], // Cloudinary URLs
    validate: {
      validator: function(arr) {
        // allow empty array or up to 5 images
        return !arr || arr.length <= 5;
      },
      message: "Cannot upload more than 5 images"
    },
    default: []
  },

  // ===== AMENITIES AND PURPOSES =====
  amenities: [{
    type: String,
    enum: [
      "WiFi", "Projector", "Whiteboard", "Air Conditioning",
      "Power Backup", "Parking", "Coffee/Tea", "Printer/Scanner",
      "Conference Phone", "Monitor", "Kitchen", "Restroom"
    ]
  }],
  purposes: [{
    type: String,
    enum: [
      "Remote Work", "Study Session", "Team Meetings",
      "Networking", "Presentations", "Creative Work",
      "Interview", "Training", "Client Meeting"
    ]
  }],

  // ===== CAPACITY =====
  capacity: {
    type: Number,
    required: [true, "Capacity is required"],
    min: [1, "Capacity must be at least 1 person"],
    max: [100, "Capacity cannot exceed 100 people"]
  },

  // ===== AVAILABILITY =====
  timeSlots: [{
    day: {
      type: String,
      required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/ // HH:MM format
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/ // HH:MM format
    }
  }],

  // ===== STATUS =====
  isActive: {
    type: Boolean,
    default: true // Soft delete flag
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true,
  },
  moderation: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
}, {
  timestamps: true // Auto-manages createdAt and updatedAt
});

// ===== PRE-SAVE MIDDLEWARE =====
spaceSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// ===== PLUGINS =====
spaceSchema.plugin(mongoosePaginate);

// ===== DATABASE INDEXES =====
// Optimize query performance for common access patterns
spaceSchema.index({ hostId: 1, isActive: 1 }); // Host dashboard queries
spaceSchema.index({ location: 1, isActive: 1 }); // Search by location
spaceSchema.index({ pricePerHour: 1, isActive: 1 }); // Search by price
spaceSchema.index({ purposes: 1, isActive: 1 }); // Search by purpose

export default mongoose.model("Space", spaceSchema);