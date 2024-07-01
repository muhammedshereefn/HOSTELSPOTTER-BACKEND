import { IVendorRepository } from "../../../domain/repositories/IVendorRepository";
import { NodemailerService } from "../../../infrastructure/mail/NodemailerService";
import { Vendor } from "../../../domain/entities/Vendor";
import bcrypt from 'bcrypt'

export class SignUpUseCase {
  constructor(
    private vendorRepository:IVendorRepository,
    private mailService : NodemailerService
  ) {}


  async execute(name:string , email:string,password:string, contact:string): Promise<void> {
    if(!password){
      throw new Error("password is required");
    }

    const existingVendor = await this.vendorRepository.findVendorByEmail(email);
    if(existingVendor){
      throw new Error("vendor alredy exists");
    }

    if(typeof password !== 'string'){
      throw new Error("password must be a string")
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const vendor = new Vendor(name,email,hashedPassword,contact,otp,new Date(),false,false,null,'pending');
    await this.vendorRepository.createVendor(vendor);
    await this.mailService.sendOtp(email,otp);

  }

}
