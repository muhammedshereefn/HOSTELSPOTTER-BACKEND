import { IPropertyRepository } from '../../../domain/repositories/IPropertyRepository';
import { Property } from '../../../domain/entities/Property';


export class GetAllPropertiesUseCase {
    constructor(private propertyRepository: IPropertyRepository) {}

    async execute(): Promise<Property[]> {
        return this.propertyRepository.findAllProperties();
    }
}