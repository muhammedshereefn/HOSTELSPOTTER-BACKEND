// src/infrastructure/database/models/PropertyModel.ts

import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  hostelName: { type: String, required: true },
  hostelLocation: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  ownerContact: { type: String, required: true },
  rent: { type: Number, required: true },
  deposite: { type: Number, required: true },
  target: { type: [String], required: true },
  policies: { type: [String], required: true },
  facilities: { type: [String], required: true },
  category: { type: String, required: true },
  availablePlans: { type: [String], required: true },
  nearbyAccess: { type: [String], required: true },
  roomQuantity: { type: Number, required: true },
  vendorId: { type:mongoose.Schema.Types.ObjectId, ref:'Vendor' ,required:true},
  hostelImages: { type: [String], required: true },
});

export const PropertyModel = mongoose.model('Property', propertySchema);
 