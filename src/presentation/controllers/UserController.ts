

import { NextFunction, Request, Response } from 'express';
import { SignUpUseCase } from '../../application/use-cases/user/SignUpUseCase';
import { SignInUseCase } from '../../application/use-cases/user/SignInUseCase';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { NodemailerService } from '../../infrastructure/mail/NodemailerService';
import { GetAllUsersUseCase } from '../../application/use-cases/user/GetAllUsersUseCase';
import { GetAllPropertiesUseCase } from '../../application/use-cases/property/GetAllPropertiesUseCase';



import jwt from 'jsonwebtoken';
import { User } from '../../domain/entities/User';
import { PropertyRepository } from '../../infrastructure/repositories/PropertyRepository';
import { GetPropertyByIdUseCase } from '../../application/use-cases/property/GetPropertyByIdUseCase';
import { AppError } from '../../errors/AppError';
import { RefreshTokenUseCase } from '../../application/use-cases/user/RefreshTokenUseCase';

const userRepository = new UserRepository();
const propertyRepository = new PropertyRepository()
const mailService = new NodemailerService();


const getAllPropertiesUseCase = new GetAllPropertiesUseCase(propertyRepository);
const getPropertyByIdUseCase = new GetPropertyByIdUseCase(propertyRepository);


export class UserController {
  static async signUp(req: Request, res: Response,next: NextFunction) {
    const { name, email, password, contact } = req.body;

    try {

      
      const signUpUseCase = new SignUpUseCase(userRepository, mailService);
      await signUpUseCase.execute(name, email, password, contact);
      res.status(201).send('User registered successfully, please verify your email');
    } catch (error) {
     
      next(error)
    }
  }



  static async signIn(req: Request, res: Response,next: NextFunction ) {
    const { email, password } = req.body;

    try {

      const user = await userRepository.findUserByEmail(email);
      if(!user){
        throw new AppError("Invalid email or password", 400);
      }



      const signInUseCase = new SignInUseCase(userRepository);
      const {accessToken,refreshToken} = await signInUseCase.execute(email, password);
      res.status(200).json({ accessToken,refreshToken });
      console.log("successfully logged in");
    } catch (error) {
      next(error)
    }
  }




  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.body;
  
    try {
      const refreshTokenUseCase = new RefreshTokenUseCase(userRepository);
      const tokens = await refreshTokenUseCase.execute(refreshToken);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }
  




  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    console.log('verifyOtp called with:', req.body);
    const { email, otp } = req.body;

    try {
      const user = await userRepository.findUserByEmail(email);
      if (!user || user.otp !== otp) {
        throw new AppError('Invalid OTP', 400);
      }

      const currentTime = new Date().getTime();
      const otpTime = new Date(user.otpCreatedAt!).getTime();
      const timeDifference = currentTime - otpTime;

      if (timeDifference > 60000) { // 1 minute in milliseconds
        throw new AppError('OTP expired', 400);
      }

      user.isVerified = true;
      user.otp = null;
      user.otpCreatedAt = null; 
      await userRepository.updateUser(user);

      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: '1h'
      });

      res.status(200).json({ message: 'Email verified successfully', token });
    } catch (error) {
      next(error);
    }
  }

  static async resendOtp(req: Request, res: Response , next: NextFunction) {
    const { email } = req.body;

    try {
      const user = await userRepository.findUserByEmail(email);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpCreatedAt = new Date(); 
      await userRepository.updateUser(user);
      await mailService.sendOtp(email, otp);

      res.status(200).json({ message: 'OTP resent successfully', otpExpiresAt: new Date(user.otpCreatedAt.getTime() + 60000) });
    } catch (error) {
      next(error);
    }
  }


  static async getAllUsers(req: Request, res: Response,next: NextFunction) {
    try {
      const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
      const users = await getAllUsersUseCase.execute();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }



  static async checkBlockStatus(req: Request, res: Response,next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new AppError('Unauthorized', 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      const userEmail = (decoded as any).email;

      const user = await userRepository.findUserByEmail(userEmail);
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      if (user.isBlocked) {
        return next(new AppError('User is blocked', 403));
      }

      res.status(200).send('User is not blocked');
    } catch (error) {
      next(new AppError('Invalid token', 401));
    }
  }


  static async getAllProperties(req: Request, res: Response, next: NextFunction) {
    try {
        const properties = await getAllPropertiesUseCase.execute();
        res.status(200).json(properties);
    } catch (error) {
      next(error);
    }
}


static async getPropertybyId(req:Request , res:Response, next: NextFunction){
  const {id} = req.params;

  try {
    const property = await getPropertyByIdUseCase.execute(id);
    if(!property){
      return next(new AppError('Property not found', 404));
    }
    res.status(200).json(property);

  } catch (error) {
    next(error);
  }
}

}
