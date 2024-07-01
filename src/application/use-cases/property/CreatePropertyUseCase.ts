import { IPropertyRepository } from '../../../domain/repositories/IPropertyRepository';
import { Property } from '../../../domain/entities/Property';


export class CreatePropertyUseCase {
    constructor(private propertyRepository: IPropertyRepository) {}
  
    async execute(property: Property): Promise<void> {
      await this.propertyRepository.createProperty(property);
    }
  }