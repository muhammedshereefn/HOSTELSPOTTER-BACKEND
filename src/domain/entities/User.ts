
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
    public _id?: string 

  ) {}
}

