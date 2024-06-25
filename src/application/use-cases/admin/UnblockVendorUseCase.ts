import { IVendorRepository } from "../../../domain/repositories/IVendorRepository";

export class UnblockVendorUseCase {
    constructor(private vendorRepository : IVendorRepository){}

    async execute(vendorId:string):Promise<void>{
        await this.vendorRepository.unblockVendor(vendorId)
    }
}