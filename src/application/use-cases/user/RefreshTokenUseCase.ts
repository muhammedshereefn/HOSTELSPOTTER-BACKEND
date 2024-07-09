import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AppError } from '../../../errors/AppError';

export class RefreshTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
      console.log('Decoded refresh token:', decoded);
      const email = (decoded as any).email;

      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const newAccessToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

      const newRefreshToken = jwt.sign({ email: user.email }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d'
      });

      console.log('Generated new tokens:', { accessToken: newAccessToken, refreshToken: newRefreshToken });
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Error during token refresh:', error);
      throw new AppError('Invalid refresh token', 401);
    }
  }
}
