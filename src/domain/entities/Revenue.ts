// src/domain/entities/Revenue.ts

export class Revenue {
    constructor(
      public amount: number,
      public type: 'subscription' | 'booking' | 'property',
      public vendorName: string,
      public createdAt: Date = new Date(),
      public _id?: string 
    ) {}
  }
  