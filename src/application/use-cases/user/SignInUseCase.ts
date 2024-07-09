import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../errors/AppError';

export class SignInUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, password: string): Promise<{accessToken:string,refreshToken:string}> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new AppError('Invalid credentials',400);
    }

    if (!user.isVerified) {
       throw new AppError('Email not verified', 403);
    }

    const accessToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: '1h'
    });

    const refreshToken = jwt.sign({email:user.email}, process.env.JWT_REFRESH_SECRET!,{
       expiresIn: '7d'
    })
    

    return { accessToken, refreshToken };
  }
}
