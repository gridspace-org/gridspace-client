const mongoose = require("mongoose");

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 600, // 10 minutes (600 seconds)
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3, // Maximum 3 attempts
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
emailVerificationSchema.index({ email: 1, otp: 1 });
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("EmailVerification", emailVerificationSchema);
