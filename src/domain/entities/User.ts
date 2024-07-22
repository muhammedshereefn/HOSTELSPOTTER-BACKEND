
export class User {
  constructor(
    public name: string,
    public email: string,
    public password: string,
    public contact: string,
    public otp: string | null,
    public otpCreatedAt: Date | null,
    public isVerified: boolean,
    public isBlocked: boolean,
    public bookingHistory: Array<{ hostelName: string, hostelLocation: string, roomName: string, bedQuantity: number, bookedAt: Date }>,
    public wallet: { balance: number, history: Array<{ amount: number, transactionType: string, transactionDate: Date }> },
    public _id?: string 

  ) {}
}

