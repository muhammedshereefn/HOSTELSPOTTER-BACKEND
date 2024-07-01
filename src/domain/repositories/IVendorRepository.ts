// src/domain/repositories/IVendorRepository.ts

import { Vendor } from '../entities/Vendor';

export interface IVendorRepository {
  createVendor(vendor: Vendor): Promise<void>;
  findVendorByEmail(email: string): Promise<Vendor | null>;
  updateVendor(vendor: Vendor): Promise<void>;

  getAllVendors():Promise<Vendor[]>
  findVendorById(id:string):Promise<Vendor | null>;
  blockVendor(vendorId:string):Promise<void>;
  unblockVendor(vendorId:string):Promise<void>;
  updateKycInfo(vendorId: string, kycImage: string): Promise<void>;
  updateKycStatus(vendorId: string, kycStatus: string): Promise<void>;
}
