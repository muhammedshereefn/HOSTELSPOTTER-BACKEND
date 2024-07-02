// src/presentation/controllers/VendorController.ts

import { NextFunction, Request, Response } from 'express';
import { SignUpUseCase } from '../../application/use-cases/vendor/SignUpUseCase';
import { SignInUseCase } from '../../application/use-cases/vendor/SignInUseCase';
import { VendorRepository } from '../../infrastructure/repositories/VendorRepository';
import { NodemailerService } from '../../infrastructure/mail/NodemailerService';
import { upload } from '../middlewares/multerMiddleware';
import { Property } from '../../domain/entities/Property';
import { CreatePropertyUseCase } from '../../application/use-cases/property/CreatePropertyUseCase';
import { PropertyRepository } from '../../infrastructure/repositories/PropertyRepository';

import { errorHandler } from '../middlewares/errorMiddleware';

import jwt from 'jsonwebtoken';
import { GetAllVendorsUseCase } from '../../application/use-cases/vendor/GetAllVendorsUseCase';
import { UploadKycUseCase } from '../../application/use-cases/vendor/UploadKycUseCase';
import { GetVendorByIdUseCase } from '../../application/use-cases/vendor/GetVendorByIdUseCase';
import { UpdatePropertyUseCase } from '../../application/use-cases/property/UpdatePropertyUseCase';
import { GetPropertyByIdUseCase } from '../../application/use-cases/property/GetPropertyByIdUseCase';
import { AppError } from '../../errors/AppError';




const vendorRepository = new VendorRepository();
const mailService = new NodemailerService();

const getVendorByIdUseCase = new GetVendorByIdUseCase(vendorRepository);

const propertyRepository = new PropertyRepository();
const createPropertyUseCase = new CreatePropertyUseCase(propertyRepository);
const updatePropertyUseCase = new UpdatePropertyUseCase(propertyRepository);
const getPropertyByIdUseCase = new GetPropertyByIdUseCase(propertyRepository);


const generateToken = (email: string, vendorId: string): string => {
  const secretKey = process.env.JWT_SECRET!; 
  const token = jwt.sign({ email, vendorId }, secretKey, { expiresIn: '1h' }); 
  return token;
};

export class VendorController {
  static async signUp(req: Request, res: Response, next: NextFunction) {
    const { name, email, password, contact } = req.body;

    try {
      const signUpUseCase = new SignUpUseCase(vendorRepository, mailService);
      await signUpUseCase.execute(name, email, password, contact);
      res.status(201).send('Vendor registered successfully, please verify your email');
    } catch (error) {
      next(error);
    }
  }



  static async signIn(req: Request, res: Response,next: NextFunction) {
    const { email, password } = req.body;

    try {
      const signInUseCase = new SignInUseCase(vendorRepository);
      const token = await signInUseCase.execute(email, password);
      res.status(200).json({ token });
      console.log("successfully logged in");
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response,next: NextFunction) {
    console.log('verifyOtp called with:', req.body);
    const { email, otp } = req.body;

    try {
      const vendor = await vendorRepository.findVendorByEmail(email);
      if (!vendor || vendor.otp !== otp) {
        throw new AppError('Invalid OTP', 400);
      }

      const currentTime = new Date().getTime();
      const otpTime = new Date(vendor.otpCreatedAt!).getTime();
      const timeDifference = currentTime - otpTime;

      if (timeDifference > 5 * 60 * 1000) { // 5 minutes
        throw new AppError('OTP expired', 400);
      }

      vendor.isVerified = true;
      vendor.otp = null;
      vendor.otpCreatedAt = null;

      await vendorRepository.updateVendor(vendor);

      const vendorId = vendor._id ? vendor._id.toString() : '';
      const token = generateToken(vendor.email,vendorId);
      
      res.status(200).json({ token, message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async resendOtp(req: Request, res: Response,next: NextFunction) {
    const { email } = req.body;

    try {
      const vendor = await vendorRepository.findVendorByEmail(email);
      if (!vendor) {
        throw new AppError('Vendor not found', 404);      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      vendor.otp = otp;
      vendor.otpCreatedAt = new Date();

      await vendorRepository.updateVendor(vendor);
      await mailService.sendOtp(email, otp);

      res.status(200).send('OTP resent successfully');
    } catch (error) {
      next(error);
    }
  }


  static async getAllVendors(req:Request,res:Response,next: NextFunction){
    try {
      const getAllVendorsUseCase = new GetAllVendorsUseCase(vendorRepository);
      const vendors = await getAllVendorsUseCase.execute();
      res.status(200).json(vendors);
    } catch (error) {
      next(error);    }
  }

  static async checkBlockStatus(req: Request, res: Response,next: NextFunction) {
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
  
      res.status(200).json({ isBlocked: vendor.isBlocked ,kycStatus: vendor.kycStatus,kycImage: vendor.kycImage});
    } catch (error) {
      next(error);
        }
  }

  static async uploadKyc(req: Request, res: Response,next: NextFunction) {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    const { vendorId } = req.body;
    const kycImage = req.file.path.replace(/\\/g, '/');
  
    try {
      if (!vendorId) {
        return res.status(400).json({ message: 'Vendor ID is required' });
      }
  
      const uploadKycUseCase = new UploadKycUseCase(vendorRepository);
      await uploadKycUseCase.execute(vendorId, kycImage);
  
      res.status(200).send('KYC document uploaded successfully');
    } catch (error) {
      next(error);
    }
  }


  static async getVendorById(req: Request, res: Response,next: NextFunction) {
    try {
      const { id } = req.params;
      const vendor = await getVendorByIdUseCase.execute(id);
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
      res.status(200).json(vendor);
    } catch (error) {
      next(error);
    }
  }
  

  static async createProperty(req: Request, res: Response,next: NextFunction) {

    const { hostelName, hostelLocation, ownerName, ownerEmail, ownerContact, rent, deposite, target, policies, facilities, category, availablePlans, nearbyAccess, roomQuantity, hostelImages } = req.body;
    const vendorId = req.body.vendorId;


    const property = new Property({
        hostelName,
        hostelLocation,
        ownerName,
        ownerEmail,
        ownerContact,
        rent,
        deposite,
        target: target ? target.split(',').map((item: string) => item.trim()) : [],
        policies: policies ? policies.split(',').map((item: string) => item.trim()) : [],
        facilities: facilities ? facilities.split(',').map((item: string) => item.trim()) : [],
        category,
        availablePlans: availablePlans ? availablePlans.split(',').map((item: string) => item.trim()) : [],
        nearbyAccess: nearbyAccess ? nearbyAccess.split(',').map((item: string) => item.trim()) : [],
        roomQuantity,
        hostelImages,
        vendorId,
    });

    try {
        await createPropertyUseCase.execute(property);
        res.status(201).json({ message: 'Property created successfully' });
    } catch (error) {
      next(error);
    }
  }


  static async listProperties(req:Request, res:Response,next: NextFunction){
    try {
      const vendorId = req.body.vendorId;
      const properties = await propertyRepository.findPropertiesByVendorId(vendorId);

      res.status(200).json(properties);
    } catch (error) {
      next(error);

    }
  }
  
  
  static async deleteProperty(req: Request, res: Response,next: NextFunction){
    const { id } = req.params;

    try {
      await propertyRepository.deleteProperty(id);
      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
      next(error);
    }
    
  }

  static async updateProperty(req: Request, res: Response, next: NextFunction) {
    console.log('inside this route')
    const { id } = req.params;
    console.log(req.body,'.....................................');
    
    const propertyData = req.body;

    console.log()

    try {
      await updatePropertyUseCase.execute(id, propertyData);
      res.status(200).json({ message: 'Property updated successfully' });
    } catch (error) {
      next(error);
    }
  }


  static async getPropertyById(req: Request, res: Response , next: NextFunction) {
    const { id } = req.params;
    try {
      const property = await getPropertyByIdUseCase.execute(id);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.status(200).json(property);
    } catch (error) {
      next(error);
    }
  }
  

}



export { errorHandler };
