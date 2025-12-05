import mongoose from "mongoose";
import { TOKENS } from "../config/constants.js";

/**
 * RefreshToken Model
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      index: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false, // manually manage createdAt
  }
);

refreshTokenSchema.index({ userId: 1, expiresAt: 1 });

refreshTokenSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    name: "refresh_token_ttl",
  }
);

refreshTokenSchema.index({ token: 1, expiresAt: 1 });

refreshTokenSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

refreshTokenSchema.methods.getTimeToExpiry = function () {
  const now = new Date();
  if (now > this.expiresAt) return 0;
  return Math.floor((this.expiresAt - now) / 1000);
};

refreshTokenSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("RefreshToken", refreshTokenSchema);
