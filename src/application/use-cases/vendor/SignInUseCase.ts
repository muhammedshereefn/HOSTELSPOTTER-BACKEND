// src/application/use-cases/vendor/SignInUseCase.ts

import { IVendorRepository } from '../../../domain/repositories/IVendorRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../errors/AppError';

export class SignInUseCase {
  constructor(private vendorRepository: IVendorRepository) {}

  async execute(email: string, password: string): Promise<string> {
    const vendor = await this.vendorRepository.findVendorByEmail(email);

    if (!vendor || !await bcrypt.compare(password, vendor.password)) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!vendor.isVerified) {
      throw new AppError('Email not verified', 403);
    }

    const token = jwt.sign(
      { email: vendor.email, vendorId: vendor._id!.toString() }, 
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return token;
  }
}
