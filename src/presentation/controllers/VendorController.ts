// src/presentation/controllers/VendorController.ts

import { Request, Response } from 'express';
import { SignUpUseCase } from '../../application/use-cases/vendor/SignUpUseCase';
import { SignInUseCase } from '../../application/use-cases/vendor/SignInUseCase';
import { VendorRepository } from '../../infrastructure/repositories/VendorRepository';
import { NodemailerService } from '../../infrastructure/mail/NodemailerService';

import jwt from 'jsonwebtoken';
import { GetAllVendorsUseCase } from '../../application/use-cases/vendor/GetAllVendorsUseCase';

const vendorRepository = new VendorRepository();
const mailService = new NodemailerService();



const generateToken = (email: string): string => {
  const secretKey = process.env.JWT_SECRET!; // Use a secure key and store it in environment variables
  const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' }); // Token valid for 1 hour
  return token;
};

export class VendorController {
  static async signUp(req: Request, res: Response) {
    const { name, email, password, contact } = req.body;

    try {
      const signUpUseCase = new SignUpUseCase(vendorRepository, mailService);
      await signUpUseCase.execute(name, email, password, contact);
      res.status(201).send('Vendor registered successfully, please verify your email');
    } catch (error) {
      if (error instanceof Error && error.message === 'Vendor already exists') {
        return res.status(400).json({ message: 'Vendor already exists' });
      }
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }

  static async signIn(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const signInUseCase = new SignInUseCase(vendorRepository);
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
      const vendor = await vendorRepository.findVendorByEmail(email);
      if (!vendor || vendor.otp !== otp) {
        throw new Error('Invalid OTP');
      }

      const currentTime = new Date().getTime();
      const otpTime = new Date(vendor.otpCreatedAt!).getTime();
      const timeDifference = currentTime - otpTime;

      if (timeDifference > 5 * 60 * 1000) { // 5 minutes
        throw new Error('OTP expired');
      }

      vendor.isVerified = true;
      vendor.otp = null;
      vendor.otpCreatedAt = null;

      await vendorRepository.updateVendor(vendor);

      const token = generateToken(vendor.email);
      res.status(200).json({ token, message: 'Email verified successfully' });
      // res.status(200).send('Email verified successfully');
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send('An unknown error occurred');
      }
    }
  }

  static async resendOtp(req: Request, res: Response) {
    console.log('resendOtp called with:', req.body);
    const { email } = req.body;

    try {
      const vendor = await vendorRepository.findVendorByEmail(email);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      vendor.otp = otp;
      vendor.otpCreatedAt = new Date();

      await vendorRepository.updateVendor(vendor);
      await mailService.sendOtp(email, otp);

      res.status(200).send('OTP resent successfully');
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send('An unknown error occurred');
      }
    }
  }


  static async getAllVendors(req:Request,res:Response){
    try {
      const getAllVendorsUseCase = new GetAllVendorsUseCase(vendorRepository);
      const vendors = await getAllVendorsUseCase.execute();
      res.status(200).json(vendors);
    } catch (error) {
      res.status(500).json({message:"An unknown error occured"})
    }
  }

  static async checkBlockStatus(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const email = decoded.email;
  
      const vendor = await vendorRepository.findVendorByEmail(email);
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
  
      res.status(200).json({ isBlocked: vendor.isBlocked });
    } catch (error) {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }

}
