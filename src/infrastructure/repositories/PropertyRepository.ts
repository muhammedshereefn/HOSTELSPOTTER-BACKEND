import { IPropertyRepository } from '../../domain/repositories/IPropertyRepository';
import { Property } from '../../domain/entities/Property';
import { PropertyModel } from '../database/models/PropertyModel';


function mapPropertyDocumentToProperty(doc: any): Property {
  return {
      ...doc,
      vendorId: doc.vendorId.toString(), // Transform ObjectId to string
      roomBedQuantities: doc.roomBedQuantities.map((item: any) => ({
          // Add necessary mappings for nested objects if any
          ...item
      }))
  };
}

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
    const properties = await PropertyModel.find().sort({ createdAt: -1 }).lean().exec();
    return properties.map(mapPropertyDocumentToProperty);
}

async findPropertyById(id: string): Promise<Property | null> {
  return PropertyModel.findById(id);
}



async findPropertyByRoomType(roomType: string) {
  return await PropertyModel.findOne({ 'roomBedQuantities.roomName': roomType });
}


async updatePropertyQ(property: any) {
  await PropertyModel.updateOne({ _id: property._id }, property);
}



async updateProperty(id: string, propertyData: Partial<Property>): Promise<void> {
  await PropertyModel.findByIdAndUpdate(id, propertyData, { new: true });
}

async countProperties(): Promise<number> {
  return PropertyModel.countDocuments();
}

 async findPropertiesGroupedByState() {
    return PropertyModel.aggregate([
      {
        $group: {
          _id: "$state",
          totalProperties: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          state: "$_id",
          totalProperties: 1
        }
      }
    ]);
  }

  async findPropertiesByState(state: string): Promise<Property[]> {
    return PropertyModel.find({ state });
}



async findBookingCountsByState(): Promise<any[]> {
  return PropertyModel.aggregate([
    {
      $group: {
        _id: "$state",
        totalBookings: { $sum: "$bookingCount" }
      }
    },
    {
      $project: {
        _id: 0,
        state: "$_id",
        totalBookings: 1
      }
    }
  ]);
}

  }
