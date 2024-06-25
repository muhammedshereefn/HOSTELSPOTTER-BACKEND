
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NodemailerService } from '../../../infrastructure/mail/NodemailerService';
import { User } from '../../../domain/entities/User';
import bcrypt from 'bcrypt';

export class SignUpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private mailService: NodemailerService
  ) {}

  async execute(name: string, email: string, password: string, contact: string): Promise<void> {
    if (!password) {
      throw new Error('Password is required');
    }

    const existingUser = await this.userRepository.findUserByEmail(email);
    if(existingUser){
      throw new Error("User alredy exists");
    }

    if (typeof password !== 'string') {
      throw new Error('Password must be a string');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User(name, email, hashedPassword, contact, otp, new Date(), false,false);
    await this.userRepository.createUser(user);
    await this.mailService.sendOtp(email, otp);
  }
}


