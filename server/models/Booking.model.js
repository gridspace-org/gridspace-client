import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const bookingSchema = new mongoose.Schema({
  // ===== CORE RELATIONSHIPS =====
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true // Faster queries for user's bookings
  },
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space", 
    required: [true, "Space ID is required"],
    index: true // Faster queries for space's bookings
  },

  // ===== PRICING STRUCTURE (15% MARKUP MODEL) =====
  // Host sets basePrice, we add 15% markup, user pays totalAmount
  basePrice: {
    type: Number,
    required: [true, "Base price is required"],
    min: [500, "Base price must be at least ₦500"] // Minimum charge
  },
  markupPercentage: {
    type: Number,
    default: 15, // Platform takes 15% as service fee
    min: 0,
    max: 100
  },
  markupAmount: {
    type: Number, // Calculated: basePrice * markupPercentage
    required: [true, "Markup amount is required"],
    min: 0
  },
  totalAmount: {
    type: Number, // What user pays: basePrice + markupAmount
    required: [true, "Total amount is required"],
    min: [500, "Total amount must be at least ₦500"]
  },
  hostEarnings: {
    type: Number, // What host receives: 100% of basePrice
    required: [true, "Host earnings amount is required"],
    min: [500, "Host earnings must be at least ₦500"]
  },

  // ===== BOOKING TYPE & DURATION =====
  // Supports both hourly ("N3,000/hour") and daily ("N5,000/day") pricing
  bookingType: {
    type: String,
    enum: ['hourly', 'daily'],
    default: 'hourly',
    required: true
  },
  duration: {
    type: Number, // Number of hours or days based on bookingType
    required: true,
    min: 1 // Minimum 1 hour/day booking
  },

  // ===== TIMING & SCHEDULING =====
  startTime: {
    type: Date,
    required: [true, "Start time is required"],
    validate: {
      validator: function(startTime) {
        return startTime > new Date(); // Prevent past bookings
      },
      message: "Start time must be in the future"
    }
  },
  endTime: {
    type: Date,
    required: [true, "End time is required"],
    validate: {
      validator: function(endTime) {
        return endTime > this.startTime; // Logical time range
      },
      message: "End time must be after start time"
    }
  },

  // ===== GUEST MANAGEMENT =====
  // From UI: "Number of Guests: 4" - used for capacity checking
  guestCount: {
    type: Number,
    required: true,
    min: [1, "At least 1 guest is required"],
    max: [100, "Cannot exceed 100 guests"], // Space capacity limit
    default: 1
  },

  // ===== STATUS MANAGEMENT =====
  // Aligned with UI terminology: "Upcoming, Pending, Completed, Canceled"
  status: {
    type: String,
    enum: [
      "pending",      // 5-minute payment window active
      "upcoming",     // Paid, booking in future
      "in_progress",  // Currently active (startTime <= now <= endTime)
      "completed",    // Successfully finished
      "cancelled"     // Cancelled by user/host
    ],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: [
      "pending",             // Awaiting payment
      "paid",                // Full payment received
      "refunded",            // Full refund processed
      "failed",              // Payment failed
      "partially_refunded"   // Partial refund (late cancellation)
    ],
    default: "pending"
  },

  // ===== RESCHEDULE SUPPORT =====
  // Tracks all reschedule attempts for audit trail
  rescheduleHistory: [{
    originalStart: Date,   // Original booking time
    originalEnd: Date,
    newStart: Date,        // New requested time
    newEnd: Date,
    rescheduledAt: {
      type: Date,
      default: Date.now
    },
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reason: String         // Why rescheduled
  }],

  // ===== CANCELLATION TRACKING =====
  // Detailed cancellation data for analytics and refund processing
  cancellationInfo: {
    cancelledAt: Date,     // When cancelled
    cancelledBy: {         // Who initiated cancellation
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reason: {
      type: String,
      enum: [
        "user_request",    // User cancelled
        "host_request",    // Host cancelled  
        "payment_timeout", // 5-minute window expired
        "system_error",    // Technical issue
        "other"            // Miscellaneous
      ]
    },
    refundAmount: Number,  // How much refunded (if any)
    notes: String          // Additional context
  },

  // ===== PAYMENT WINDOW MANAGEMENT =====
  // 5-minute expiry for pending bookings to prevent slot hogging
  expiresAt: {
    type: Date,
    required: function() {
      return this.status === 'pending'; // Only required for pending bookings
    }
  },

  // ===== ADDITIONAL INFORMATION =====
  specialRequests: {
    type: String,
    maxlength: [500, "Special requests cannot exceed 500 characters"],
    trim: true
  },
  hostNotes: {
    type: String, // Internal notes for host reference
    maxlength: [500, "Host notes cannot exceed 500 characters"],
    trim: true
  },

  // ===== SYSTEM FIELDS =====
  isActive: {
    type: Boolean,
    default: true // Soft delete flag
  }
}, {
  timestamps: true // Auto-manages createdAt and updatedAt
});

// ===== PRE-SAVE MIDDLEWARE =====
// Handles automatic calculations before saving to database
bookingSchema.pre("save", function(next) {
  // Calculate duration based on booking type (hourly vs daily)
  if (this.isModified("startTime") || this.isModified("endTime")) {
    const timeDiff = this.endTime - this.startTime;
    
    if (this.bookingType === 'daily') {
      this.duration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert to days
    } else {
      this.duration = Math.ceil(timeDiff / (1000 * 60 * 60)); // Convert to hours
    }
  }

  // Auto-calculate pricing when basePrice changes
  if (this.isModified("basePrice") && this.basePrice) {
    const totalBasePrice = this.basePrice * this.duration;
    this.markupAmount = Math.round(totalBasePrice * (this.markupPercentage / 100));
    this.totalAmount = totalBasePrice + this.markupAmount;
    this.hostEarnings = totalBasePrice; // Host gets 100% of their asking price
  }

  // Set 5-minute expiry for new pending bookings
  if (this.status === 'pending' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  }

  next();
});

// Add pagination plugin for efficient large dataset handling
bookingSchema.plugin(mongoosePaginate);

// ===== DATABASE INDEXES =====
// Optimize query performance for common access patterns
bookingSchema.index({ spaceId: 1, startTime: 1, endTime: 1 }); // Conflict detection
bookingSchema.index({ userId: 1, status: 1 });                 // User dashboard queries
bookingSchema.index({ spaceId: 1, status: 1 });                // Host management queries
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-cleanup expired
bookingSchema.index({ status: 1, paymentStatus: 1 });          // Admin reporting
bookingSchema.index({ "cancellationInfo.cancelledAt": 1 });    // Cancellation analytics

// ===== VIRTUAL FIELDS =====
// Computed properties that don't persist to database
bookingSchema.virtual("isUpcoming").get(function() {
  return ["pending", "upcoming"].includes(this.status) && this.startTime > new Date();
});

bookingSchema.virtual("canReschedule").get(function() {
  const hoursUntilStart = (this.startTime - new Date()) / (1000 * 60 * 60);
  return ["pending", "upcoming"].includes(this.status) && hoursUntilStart > 2;
});

bookingSchema.virtual("canCancel").get(function() {
  const hoursUntilStart = (this.startTime - new Date()) / (1000 * 60 * 60);
  return ["pending", "upcoming"].includes(this.status) && hoursUntilStart > 2;
});

// UI-friendly date formatting (matches "June 22nd, 2025" from designs)
bookingSchema.virtual("formattedDate").get(function() {
  return this.startTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// UI-friendly time formatting (matches "9:00 AM to 4:00 PM" from designs)
bookingSchema.virtual("formattedTime").get(function() {
  return `${this.startTime.toLocaleTimeString()} to ${this.endTime.toLocaleTimeString()}`;
});

// Ensure virtual fields are included when converting to JSON
bookingSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Booking", bookingSchema);