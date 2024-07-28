// src/infrastructure/database/models/UserModel.ts
import mongoose from 'mongoose';


const bookingHistorySchema = new mongoose.Schema({
  hostelName: { type: String, required: true },
  hostelLocation: { type: String, required: true },
  roomName: { type: String, required: true },
  bedQuantity: { type: Number, required: true },
  bookedAt: { type: Date, required: true },
}, { _id: true });



const walletHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  transactionType: { type: String, required: true }, 
  transactionDate: { type: Date, required: true, default: Date.now },
  hostelName: { type: String, required: true },
});

const walletSchema = new mongoose.Schema({
  balance: { type: Number, required: true, default: 0 },
  history: { type: [walletHistorySchema], default: [] },
});


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String, required: true },
  otp: { type: String, required: false },
  otpCreatedAt: { type: Date, required: false }, 
  isVerified: { type: Boolean, required: true, default: false },
  isBlocked: {type:Boolean,required:true,default:false},
  bookingHistory: { type: [bookingHistorySchema], default: [] },
  wallet: { type: walletSchema, default: { balance: 0, history: [] } },
});
export const UserModel = mongoose.model('User', userSchema);
