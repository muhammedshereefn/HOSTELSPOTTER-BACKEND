import { IPropertyRepository } from "../../../domain/repositories/IPropertyRepository";

export class GetPropervatiesByVendorUseCase {
    constructor(private propertyRepository: IPropertyRepository){}

    async execute(vendorId: string) {
        return this.propertyRepository.findPropertiesByVendorId(vendorId);
    }
}