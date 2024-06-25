

import { Request, Response } from 'express';
import { SignUpUseCase } from '../../application/use-cases/user/SignUpUseCase';
import { SignInUseCase } from '../../application/use-cases/user/SignInUseCase';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { NodemailerService } from '../../infrastructure/mail/NodemailerService';
import { GetAllUsersUseCase } from '../../application/use-cases/user/GetAllUsersUseCase';

import jwt from 'jsonwebtoken';
import { User } from '../../domain/entities/User';

const userRepository = new UserRepository();
const mailService = new NodemailerService();

export class UserController {
  static async signUp(req: Request, res: Response) {
    const { name, email, password, contact } = req.body;

    try {

      
      const signUpUseCase = new SignUpUseCase(userRepository, mailService);
      await signUpUseCase.execute(name, email, password, contact);
      res.status(201).send('User registered successfully, please verify your email');
    } catch (error) {
      if (error instanceof Error && error.message === 'User already exists') {
        return res.status(400).json({ message: 'User already exists' });
      }
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }



  static async signIn(req: Request, res: Response) {
    const { email, password } = req.body;

    try {

      const user = await userRepository.findUserByEmail(email);
      if(!user){
        return res.status(400).json({message:"Invalid email or password"})
      }

      // if(user.isBlocked){
      //   res.status(400).json({message:'User is blocked'});
      // }

      const signInUseCase = new SignInUseCase(userRepository);
      const token = await signInUseCase.execute(email, password);
      res.status(200).json({ token });
      console.log("successfully logged in");
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send('An unknown error occurred');
      }
    }
  }

  




  static async verifyOtp(req: Request, res: Response) {
    console.log('verifyOtp called with:', req.body);
    const { email, otp } = req.body;

    try {
      const user = await userRepository.findUserByEmail(email);
      if (!user || user.otp !== otp) {
        throw new Error('Invalid OTP');
      }

      const currentTime = new Date().getTime();
      const otpTime = new Date(user.otpCreatedAt!).getTime();
      const timeDifference = currentTime - otpTime;

      if (timeDifference > 60000) { // 1 minute in milliseconds
        throw new Error('OTP expired');
      }

      user.isVerified = true;
      user.otp = null;
      user.otpCreatedAt = null; // Clear the otpCreatedAt field
      await userRepository.updateUser(user);

      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: '1h'
      });

      res.status(200).json({ message: 'Email verified successfully', token });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  static async resendOtp(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const user = await userRepository.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpCreatedAt = new Date(); 
      await userRepository.updateUser(user);
      await mailService.sendOtp(email, otp);

      res.status(200).json({ message: 'OTP resent successfully', otpExpiresAt: new Date(user.otpCreatedAt.getTime() + 60000) });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }


  static async getAllUsers(req: Request, res: Response) {
    try {
      const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
      const users = await getAllUsersUseCase.execute();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }



  static async checkBlockStatus(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).send('Unauthorized');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      const userEmail = (decoded as any).email;

      const user = await userRepository.findUserByEmail(userEmail);
      if (!user) {
        return res.status(404).send('User not found');
      }

      if (user.isBlocked) {
        return res.status(403).send('User is blocked');
      }

      res.status(200).send('User is not blocked');
    } catch (error) {
      return res.status(401).send('Invalid token');
    }
  }




}
