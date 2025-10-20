import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  otp: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: { 
    type: Date, 
    required: true, 
    default: Date.now, 
    expires: 86400 
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

export default mongoose.model("EmailVerification", emailVerificationSchema);
