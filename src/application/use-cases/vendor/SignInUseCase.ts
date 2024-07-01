// src/application/use-cases/vendor/SignInUseCase.ts

import { IVendorRepository } from '../../../domain/repositories/IVendorRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class SignInUseCase {
  constructor(private vendorRepository: IVendorRepository) {}

  async execute(email: string, password: string): Promise<string> {
    const vendor = await this.vendorRepository.findVendorByEmail(email);
    console.log(vendor, "[][][][][][][");

    if (!vendor || !await bcrypt.compare(password, vendor.password)) {
      throw new Error('Invalid credentials');
    }

    if (!vendor.isVerified) {
      throw new Error('Email not verified');
    }

    const token = jwt.sign(
      { email: vendor.email, vendorId: vendor._id!.toString() }, // Non-null assertion here
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return token;
  }
}
