// src/infrastructure/repositories/VendorRepository.ts

import { IVendorRepository } from '../../domain/repositories/IVendorRepository';
import { Vendor } from '../../domain/entities/Vendor';
import { VendorModel } from '../database/models/VendorModel';

export class VendorRepository implements IVendorRepository {
  async createVendor(vendor: Vendor): Promise<void> {
    const vendorModel = new VendorModel(vendor);
    await vendorModel.save();
  }

  async findVendorByEmail(email: string): Promise<Vendor | null> {
    const vendor = await VendorModel.findOne({ email }).lean();
    if (!vendor) return null;

    return new Vendor(vendor.name, vendor.email, vendor.password, vendor.contact, vendor.otp ?? null, vendor.otpCreatedAt ?? null, vendor.isVerified,vendor.isBlocked,vendor.kycImage ?? null,vendor.kycStatus ?? null,vendor.getPremium,vendor.payed,vendor._id.toString());
  }

  async updateVendor(vendor: Vendor): Promise<void> {
    await VendorModel.updateOne({ email: vendor.email }, vendor);
  }

  async getAllVendors():Promise<Vendor[]>{
    const vendors = await VendorModel.find().lean();
    return vendors.map(vendor => new Vendor(vendor.name, vendor.email, vendor.password, vendor.contact, vendor.otp ?? null, vendor.otpCreatedAt ?? null, vendor.isVerified,vendor.isBlocked,vendor.kycImage ?? null, vendor.kycStatus ?? null,vendor.getPremium,vendor.payed,vendor._id.toString()));
    
  }

  async findVendorById(id: string): Promise<Vendor | null> {
    const vendor = await VendorModel.findById(id).lean();

    if(!vendor) return null
    return new Vendor(vendor.name,vendor.email,vendor.password,vendor.contact,vendor.otp?? null , vendor.otpCreatedAt ?? null, vendor.isVerified,vendor.isBlocked,vendor.kycImage ?? null,vendor.kycStatus ??null,vendor.getPremium,vendor.payed,vendor._id.toString())
  }

   async blockVendor(vendorId: string): Promise<void> {
    await VendorModel.updateOne({_id:vendorId},{$set: {isBlocked : true}})   
  }

   async unblockVendor(vendorId: string): Promise<void> {
    await VendorModel.updateOne({_id:vendorId},{isBlocked:false});   
  }

  async updateKycInfo(vendorId: string, kycImage: string): Promise<void> {
    await VendorModel.updateOne({ _id: vendorId }, { kycImage, kycStatus: 'pending' });
  }

  async updateKycStatus(vendorId:string,kycStatus:string):Promise<void>{
    await VendorModel.updateOne({_id:vendorId},{kycStatus})
  }



  async countVendors(): Promise<number> {
    return VendorModel.countDocuments();
  }
  
  async countPremiumVendors(): Promise<number> {
    return await VendorModel.countDocuments({ getPremium: true });
  }
  
}
