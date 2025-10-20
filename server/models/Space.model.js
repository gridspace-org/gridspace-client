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

  // ===== MEDIA =====
  images: [{
    type: String, // Cloudinary URLs
    validate: {
      validator: function(images) {
        return images.length <= 5;
      },
      message: "Cannot upload more than 5 images"
    }
  }],

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

  // ===== STATUS =====
  isActive: {
    type: Boolean,
    default: true // Soft delete flag
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