// src/application/use-cases/property/UpdatePropertyUseCase.ts
import { IPropertyRepository } from "../../../domain/repositories/IPropertyRepository";
import { Property } from "../../../domain/entities/Property"; 
export class UpdatePropertyUseCase {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(id: string, propertyData: Partial<Property>): Promise<void> {
    await this.propertyRepository.updateProperty(id, propertyData);
  }
}
