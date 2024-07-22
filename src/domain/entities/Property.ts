// src/domain/entities/Property.ts

export class Property {
    public hostelName: string;
    public hostelLocation: string;
    public state: string;
    public district: string;
    public city: string;
    public ownerName: string;
    public ownerEmail: string;
    public ownerContact: string;
    public rent: number;
    public deposite: number;
    public target: string[];
    public policies: string[];
    public facilities: string[];
    public category: string;
    public availablePlans: string[];
    public nearbyAccess: string[];
    public roomQuantity: number;
    public vendorId: string;
    hostelImages: string[];
    public roomBedQuantities: { roomName: string; bedQuantity: number }[];
    public latitude: number;           
    public longitude: number; 
    public bookingCount: number;
    public createdAt?: Date; 
    public updatedAt?: Date; 
  
    constructor(data: {
      hostelName: string;
      hostelLocation: string;
      state: string;
      district: string;
      city: string;

      ownerName: string;
      ownerEmail: string;
      ownerContact: string;
      rent: number;
      deposite: number;
      target: string[];
      policies: string[];
      facilities: string[];
      category: string;
      availablePlans: string[];
      nearbyAccess: string[];
      roomQuantity: number;
      vendorId:string;
      hostelImages: string[]
      roomBedQuantities: { roomName: string; bedQuantity: number }[];
      latitude: number;              
      longitude: number;  
      bookingCount?: number;
      createdAt?: Date;
      updatedAt?: Date;           
    }) {
      this.hostelName = data.hostelName;
      this.hostelLocation = data.hostelLocation;
      this.state = data.state;
      this.district = data.state;
      this.city = data.city;

      this.ownerName = data.ownerName;
      this.ownerEmail = data.ownerEmail;
      this.ownerContact = data.ownerContact;
      this.rent = data.rent;
      this.deposite = data.deposite;
      this.target = data.target;
      this.policies = data.policies;
      this.facilities = data.facilities;
      this.category = data.category;
      this.availablePlans = data.availablePlans;
      this.nearbyAccess = data.nearbyAccess;
      this.roomQuantity = data.roomQuantity;
      this.vendorId = data.vendorId;
      this.hostelImages = data.hostelImages;
      this.roomBedQuantities = data.roomBedQuantities;
      this.latitude = data.latitude;           
      this.longitude = data.longitude;  
      this.bookingCount = data.bookingCount ?? 0;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;      
    }
  }
  
  