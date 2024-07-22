// src/infrastructure/database/models/RevenueModel.ts

import mongoose from 'mongoose';

const revenueSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ['subscription', 'booking', 'property'] },
  createdAt: { type: Date, default: Date.now }
});

export const RevenueModel = mongoose.model('Revenue', revenueSchema);
