import { IPropertyRepository } from '../../domain/repositories/IPropertyRepository';
import { Property } from '../../domain/entities/Property';
import { PropertyModel } from '../database/models/PropertyModel';


export class PropertyRepository implements IPropertyRepository {
    async createProperty(property: Property): Promise<void> {
      const newProperty = new PropertyModel(property);
      await newProperty.save();
    }
  
    async findPropertiesByVendorId(vendorId: string): Promise<Property[]> {
      return PropertyModel.find({ vendorId });
    }
    async deleteProperty(id: string): Promise<void> {
      await PropertyModel.findByIdAndDelete(id);
  }

  async findAllProperties(): Promise<Property[]> {
    return PropertyModel.find();
}

async findPropertyById(id: string): Promise<Property | null> {
  return PropertyModel.findById(id);
}





async updateProperty(id: string, propertyData: Partial<Property>): Promise<void> {
  await PropertyModel.findByIdAndUpdate(id, propertyData, { new: true });
}

  }
