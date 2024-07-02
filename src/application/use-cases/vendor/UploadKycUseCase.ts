import { IVendorRepository } from "../../../domain/repositories/IVendorRepository";
import { AppError } from "../../../errors/AppError";

export class UploadKycUseCase {
    constructor(private vendorRepository: IVendorRepository) {}

    async execute(vendorId:string,kycImage:string):Promise<void>{
        const vendor = await this.vendorRepository.findVendorById(vendorId);
        if(!vendor){
            throw new AppError('Vendor not found', 404);
        }
        await this.vendorRepository.updateKycInfo(vendorId,kycImage)
    }

}