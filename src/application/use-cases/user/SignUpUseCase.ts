
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NodemailerService } from '../../../infrastructure/mail/NodemailerService';
import { User } from '../../../domain/entities/User';
import bcrypt from 'bcrypt';
import { AppError } from '../../../errors/AppError';

export class SignUpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private mailService: NodemailerService
  ) {}

  async execute(name: string, email: string, password: string, contact: string): Promise<void> {
    if (!password) {
      throw new AppError('Password is required',400);
    }

    const existingUser = await this.userRepository.findUserByEmail(email);
    if(existingUser){
      throw new AppError("User already exists", 409);
    }

    if (typeof password !== 'string') {
      throw new AppError('Password must be a string', 400);    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User(name, email, hashedPassword, contact, otp, new Date(), false,false,[],{ balance: 0, history: [] });
    await this.userRepository.createUser(user);
    await this.mailService.sendOtp(email, otp);
  }
}


