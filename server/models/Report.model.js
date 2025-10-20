import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Reporter ID is required"],
    index: true
  },
  reportedSpaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space",
    required: function() {
      return !this.reportedUserId; // Require space OR user to be reported
    }
  },
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: function() {
      return !this.reportedSpaceId; // Require user OR space to be reported
    }
  },
  type: {
    type: String,
    required: [true, "Report type is required"],
    enum: [
      "scam", 
      "fake_listing", 
      "inappropriate_content", 
      "spam", 
      "safety_concern",
      "fraudulent_activity",
      "harassment",
      "price_gouging", // Nigerian context: overpricing complaints
      "facility_misrepresentation", // Space doesn't match photos
      "other"
    ]
  },
  reason: {
    type: String,
    required: [true, "Report reason is required"],
    trim: true,
    maxlength: [500, "Reason cannot exceed 500 characters"]
  },
  description: {
    type: String,
    required: [true, "Detailed description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  evidence: [{
    type: String, // Cloudinary URLs for screenshots, photos, etc.
  }],
  status: {
    type: String,
    enum: ["pending", "under_review", "resolved", "dismissed"],
    default: "pending"
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, "Admin notes cannot exceed 1000 characters"]
  },
  actionTaken: {
    type: String,
    enum: [
      "space_removed", 
      "user_warned", 
      "user_suspended", 
      "user_banned", 
      "content_edited",
      "no_action",
      "pending_verification"
    ]
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // Admin user who resolved it
  },
  resolvedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
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
reportSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  
  // Auto-set priority based on report type
  if (this.isModified("type") && !this.priority) {
    const criticalTypes = ["scam", "safety_concern", "fraudulent_activity"];
    const highTypes = ["fake_listing", "harassment"];
    
    if (criticalTypes.includes(this.type)) {
      this.priority = "critical";
    } else if (highTypes.includes(this.type)) {
      this.priority = "high";
    }
  }
  
  next();
});

// Compound indexes for efficient admin queries
reportSchema.index({ status: 1, priority: -1 });
reportSchema.index({ type: 1, createdAt: -1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ reportedSpaceId: 1 });
reportSchema.index({ reportedUserId: 1 });
reportSchema.index({ createdAt: -1 });

// Virtual for report age (days since creation)
reportSchema.virtual("daysOpen").get(function() {
  if (this.status === "resolved" || this.status === "dismissed") {
    return Math.ceil((this.resolvedAt - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual to check if report is urgent
reportSchema.virtual("isUrgent").get(function() {
  return this.priority === "critical" || 
         (this.priority === "high" && this.daysOpen > 2);
});

// Ensure virtual fields are serialized
reportSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Report", reportSchema);