// src/domain/entities/Property.ts

export class Property {
    public hostelName: string;
    public hostelLocation: string;
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
  
    constructor(data: {
      hostelName: string;
      hostelLocation: string;
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
    }) {
      this.hostelName = data.hostelName;
      this.hostelLocation = data.hostelLocation;
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
    }
  }
  