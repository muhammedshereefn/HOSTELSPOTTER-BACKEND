import { IVendorRepository } from "../../../domain/repositories/IVendorRepository";
import { Vendor } from "../../../domain/entities/Vendor";

export class GetAllVendorsUseCase {
    constructor (private vendorRepository : IVendorRepository){}

    async execute():Promise<Vendor[]>{
        const vendors = await this.vendorRepository.getAllVendors();
        return vendors.filter(vendor => vendor.isVerified);
        
    }
}