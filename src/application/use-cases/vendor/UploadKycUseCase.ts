import { IVendorRepository } from "../../../domain/repositories/IVendorRepository";

export class UploadKycUseCase {
    constructor(private vendorRepository: IVendorRepository) {}

    async execute(vendorId:string,kycImage:string):Promise<void>{
        const vendor = await this.vendorRepository.findVendorById(vendorId);
        if(!vendor){
            throw new Error('Vendor not found');
        }
        await this.vendorRepository.updateKycInfo(vendorId,kycImage)
    }

}