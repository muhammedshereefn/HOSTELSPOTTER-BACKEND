import jwt from 'jsonwebtoken';
import { IVendorRepository } from '../../../domain/repositories/IVendorRepository';
import { AppError } from '../../../errors/AppError';

export class RefreshTokenUseCase {
  constructor(private vendorRepository: IVendorRepository) {}

  async execute(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
      const { email, vendorId } = decoded as { email: string, vendorId: string };

      const vendor = await this.vendorRepository.findVendorByEmail(email);
      if (!vendor) {
        throw new AppError('Vendor not found', 404);
      }

      const newAccessToken = jwt.sign({ email: vendor.email, vendorId: vendor._id!.toString() }, process.env.JWT_SECRET!, { expiresIn: '1h' });

      const newRefreshToken = jwt.sign({ email: vendor.email, vendorId: vendor._id!.toString() }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Error during token refresh:', error);
      throw new AppError('Invalid refresh token', 401);
    }
  }
}
