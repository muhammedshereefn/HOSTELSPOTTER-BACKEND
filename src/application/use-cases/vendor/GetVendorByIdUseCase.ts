import { IVendorRepository } from "../../../domain/repositories/IVendorRepository";
import { Vendor } from "../../../domain/entities/Vendor";

export class GetVendorByIdUseCase {
    constructor(private vendorRepository: IVendorRepository){}

    async execute(id:string):Promise<Vendor| null>{
        return this.vendorRepository.findVendorById(id);
    }
}