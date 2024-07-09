// // src/application/use-cases/vendor/SignInUseCase.ts

// import { IVendorRepository } from '../../../domain/repositories/IVendorRepository';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { AppError } from '../../../errors/AppError';

// export class SignInUseCase {
//   constructor(private vendorRepository: IVendorRepository) {}

//   async execute(email: string, password: string): Promise<string> {
//     const vendor = await this.vendorRepository.findVendorByEmail(email);

//     if (!vendor || !await bcrypt.compare(password, vendor.password)) {
//       throw new AppError('Invalid credentials', 401);
//     }

//     if (!vendor.isVerified) {
//       throw new AppError('Email not verified', 403);
//     }

//     const token = jwt.sign(
//       { email: vendor.email, vendorId: vendor._id!.toString() }, 
//       process.env.JWT_SECRET!,
//       { expiresIn: '1h' }
//     );

//     return token;
//   }
// }



import { IVendorRepository } from '../../../domain/repositories/IVendorRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../errors/AppError';

export class SignInUseCase {
  constructor(private vendorRepository: IVendorRepository) {}

  async execute(email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
    const vendor = await this.vendorRepository.findVendorByEmail(email);

    if (!vendor || !await bcrypt.compare(password, vendor.password)) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!vendor.isVerified) {
      throw new AppError('Email not verified', 403);
    }

    const accessToken = jwt.sign(
      { email: vendor.email, vendorId: vendor._id!.toString() }, 
      process.env.JWT_SECRET!,
      { expiresIn: '2m' }
    );

    const refreshToken = jwt.sign(
      { email: vendor.email, vendorId: vendor._id!.toString() }, 
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    // Optionally, save refreshToken in database or cache here

    return { accessToken, refreshToken };
  }
}


