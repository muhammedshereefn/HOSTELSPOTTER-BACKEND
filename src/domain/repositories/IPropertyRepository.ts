import { Property } from '../entities/Property';

export interface IPropertyRepository {
    createProperty(property: Property): Promise<void>;
    findPropertiesByVendorId(vendorId: string): Promise<Property[]>;
    deleteProperty(id: string): Promise<void>;
    findAllProperties(): Promise<Property[]>;
    findPropertyById(id: string): Promise<Property | null>;
    updateProperty(id: string, propertyData: Partial<Property>): Promise<void>;

  }