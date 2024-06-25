

// src/infrastructure/database/models/UserModel.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String, required: true },
  otp: { type: String, required: false },
  otpCreatedAt: { type: Date, required: false }, 
  isVerified: { type: Boolean, required: true, default: false },
  isBlocked: {type:Boolean,required:true,default:false}


});

export const UserModel = mongoose.model('User', userSchema);
