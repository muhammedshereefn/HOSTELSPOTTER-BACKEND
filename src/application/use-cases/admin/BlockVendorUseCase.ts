import { IVendorRepository } from "../../../domain/repositories/IVendorRepository";

export class BlockVendorUseCase{
    constructor(private vendorRepository: IVendorRepository){}

    async execute(vendorId:string):Promise<void>{
        await this.vendorRepository.blockVendor(vendorId);
    }
}