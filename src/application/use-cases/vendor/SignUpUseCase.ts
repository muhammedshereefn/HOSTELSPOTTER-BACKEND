import { IVendorRepository } from "../../../domain/repositories/IVendorRepository";
import { NodemailerService } from "../../../infrastructure/mail/NodemailerService";
import { Vendor } from "../../../domain/entities/Vendor";
import bcrypt from 'bcrypt'
import { AppError } from "../../../errors/AppError";

export class SignUpUseCase {
  constructor(
    private vendorRepository:IVendorRepository,
    private mailService : NodemailerService
  ) {}


  async execute(name:string , email:string,password:string, contact:string): Promise<void> {
    
    if(!password){
      throw new AppError("Password is required", 400);
    }

    const existingVendor = await this.vendorRepository.findVendorByEmail(email);
    if(existingVendor){
      throw new AppError("Vendor already exists", 409);
    }

    if(typeof password !== 'string'){
      throw new AppError("Password must be a string", 400);
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const vendor = new Vendor(name,email,hashedPassword,contact,otp,new Date(),false,false,null,'pending');
    await this.vendorRepository.createVendor(vendor);
    await this.mailService.sendOtp(email,otp);

  }

}
