import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  expiresAt: { 
    type: Date, 
    required: true, 
    default: Date.now, 
    expires: 
    3600 },
  used: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

passwordResetSchema.index({ email: 1, token: 1 });

export default mongoose.model("PasswordReset", passwordResetSchema);