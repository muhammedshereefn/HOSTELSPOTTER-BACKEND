// src/infrastructure/database/models/VendorModel.ts

import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String, required: true },
  otp: { type: String, required: false },
  otpCreatedAt: { type: Date, required: false }, 
  isVerified: { type: Boolean, required: true, default: false },
  isBlocked: {type:Boolean,required:true,default:false},
  kycImage: { type: String, required: false },
  kycStatus: { type: String, required: false, default: 'pending' }
});

export const VendorModel = mongoose.model('Vendor', vendorSchema);


