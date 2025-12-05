import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { PASSWORD } from "../config/constants.js";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  phonenumber: {
    type: String,
    required: function () {
      return this.authProvider !== "google"; // Only required for local users
    },
    unique: true,
    sparse: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password is required only if not using Google OAuth
    },
    minlength: [6, "Password must be at least 6 characters long"],
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  role: {
    type: String,
    enum: ["user", "host", "admin"],
    default: "user",
  },

  permissions: {
    type: [String],
    default: [],
  },
  profilePic: {
    type: String,
    default: null,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  purposes: [
    {
      type: String,
    },
  ],

  isActive: {
    type: Boolean,
    default: true,
  },
  suspension: {
    isSuspended: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      enum: [
        "fraud",
        "policy_violation",
        "chargeback_dispute",
        "abuse",
        "other",
        null,
      ],
      default: null,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    resumeAt: {
      type: Date,
      default: null,
    },
  },
  location: {
    type: String,
    trim: true,
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(PASSWORD.BCRYPT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, "suspension.isSuspended": 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model("User", userSchema);
