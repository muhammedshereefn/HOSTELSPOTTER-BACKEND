// src/application/use-cases/property/GetPropertyByIdUseCase.ts
import { IPropertyRepository } from '../../../domain/repositories/IPropertyRepository';
import { Property } from '../../../domain/entities/Property';

export class GetPropertyByIdUseCase {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(id: string): Promise<Property | null> {
    return this.propertyRepository.findPropertyById(id);
  }
}
