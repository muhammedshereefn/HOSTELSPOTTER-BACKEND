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
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { RevenueModel } from '../../infrastructure/database/models/RevenueModel';
import { errorHandler } from '../middlewares/errorMiddleware';

import jwt from 'jsonwebtoken';
import { GetAllVendorsUseCase } from '../../application/use-cases/vendor/GetAllVendorsUseCase';
import { UploadKycUseCase } from '../../application/use-cases/vendor/UploadKycUseCase';
import { GetVendorByIdUseCase } from '../../application/use-cases/vendor/GetVendorByIdUseCase';
import { UpdatePropertyUseCase } from '../../application/use-cases/property/UpdatePropertyUseCase';
import { GetPropertyByIdUseCase } from '../../application/use-cases/property/GetPropertyByIdUseCase';
import { AppError } from '../../errors/AppError';

import { createOrder,verifyPaymentSignature } from '../../infrastructure/payment/RazorpayService';
import { RefreshTokenUseCase } from '../../application/use-cases/vendor/RefreshTokenUseCase';
import { RevenueRepository } from '../../infrastructure/repositories/RevenueRepository';
import { Revenue } from '../../domain/entities/Revenue';



const vendorRepository = new VendorRepository();
const revenueRepository = new RevenueRepository();
const mailService = new NodemailerService();

const getVendorByIdUseCase = new GetVendorByIdUseCase(vendorRepository);

const propertyRepository = new PropertyRepository();
const createPropertyUseCase = new CreatePropertyUseCase(propertyRepository);
const updatePropertyUseCase = new UpdatePropertyUseCase(propertyRepository);
const getPropertyByIdUseCase = new GetPropertyByIdUseCase(propertyRepository);


const generateTokens = (email: string, vendorId: string) => {
  const accessToken = jwt.sign({ email, vendorId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ email, vendorId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
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
      const { accessToken, refreshToken } = await signInUseCase.execute(email, password);
      res.status(200).json({ accessToken, refreshToken });
      console.log("successfully logged in");
    } catch (error) {
      next(error);
    }
  }


  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.body;

    try {
      const refreshTokenUseCase = new RefreshTokenUseCase(vendorRepository);
      const tokens = await refreshTokenUseCase.execute(refreshToken);
      res.status(200).json(tokens);
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
      const { accessToken, refreshToken } = generateTokens(vendor.email, vendorId);
      
      res.status(200).json({ accessToken, refreshToken, message: 'Email verified successfully' });
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
  
      res.status(200).json({ isBlocked: vendor.isBlocked ,kycStatus: vendor.kycStatus,kycImage: vendor.kycImage, getPremium: vendor.getPremium,payed:vendor.payed});
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
  

  static async createProperty(req: Request, res: Response, next: NextFunction) {
    const {
      hostelName,
      hostelLocation,
      state,
      district,
      city,

      ownerName,
      ownerEmail,
      ownerContact,
      rent,
      deposite,
      target,
      policies,
      facilities,
      category,
      availablePlans,
      nearbyAccess,
      roomQuantity,
      hostelImages,
      roomBedQuantities,
      longitude, 
      latitude   
    } = req.body;
  
    const vendorId = req.body.vendorId;
    console.log(vendorId,"[][][][][][][][][]+++++++++++++____________");
    
  
    // Ensure roomBedQuantities is parsed correctly
    const parsedRoomBedQuantities = roomBedQuantities.map((item: any) => ({
      roomName: item.roomName,
      bedQuantity: Number(item.bedQuantity) 
    }));
  
    const property = new Property({
      hostelName,
      hostelLocation,
      state,
      district,
      city,

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
      roomBedQuantities: parsedRoomBedQuantities, 
      vendorId,
      longitude, 
      latitude   
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
    const { id } = req.params;
    
    const propertyData = req.body;


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



  //Rzorpay
  static async createSubscriptionOrder(req:Request,res:Response,next:NextFunction){
    try {
      const order = await createOrder(129,'INR');
      res.status(201).json({orderId:order.id,amount:order.amount,currency:order.currency});
    } catch (error) {
      next(error);
    }
  }


  static async verifySubscription(req: Request, res: Response, next: NextFunction) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body; 
    const vendorId = req.body.vendorId;

    try {
        const isValidSignature = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValidSignature) {
            throw new AppError('Invalid payment signature', 400);
        }

       
        const vendor = await vendorRepository.findVendorById(vendorId);
        if (!vendor) {
            throw new AppError('Vendor not found', 404);
        }

        vendor.getPremium = true;
        await vendorRepository.updateVendor(vendor);

        const revenue = new Revenue(129,'subscription',vendor.name);
        await revenueRepository.createRevenue(revenue);


        res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
        next(error);
    }
}




//propertypayment
 static async createPropertyOrder(req: Request, res: Response, next: NextFunction){
  try {
    const order = await createOrder(49,'INR');
    res.status(201).json({orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (error) {
    next(error);
  }
 }



 static async verifyPropertyPayment(req: Request, res: Response, next: NextFunction) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const vendorId = req.body.vendorId;

  try {
    const isValidSignature = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValidSignature) {
        throw new AppError('Invalid payment signature', 400);
      }

      // Update vendor's payed status
      const vendor = await vendorRepository.findVendorById(vendorId);
      if (!vendor) {
        throw new AppError('Vendor not found', 404);
      }

      
      await vendorRepository.updateVendor(vendor);

      const revenue = new Revenue(49, 'property',vendor.name);
      await revenueRepository.createRevenue(revenue);

      res.status(200).json({ message: 'Payment successful' });
  } catch (error) {
    
  }
 }


 static async getPropertyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { hostelName } = req.params;


    const users = await UserModel.find(
      { 'bookingHistory.hostelName': hostelName },
      { name: 1, contact: 1, bookingHistory: 1 }
    ).lean(); //get plain JavaScript objects : lean()

    // Flatten the booking histories for the specified hostel
    const bookings = users.flatMap(user =>
      user.bookingHistory
        .filter(booking => booking.hostelName === hostelName)
        .map(booking => ({
          name: user.name,
          contact: user.contact,
          roomName: booking.roomName,
          bedQuantity: booking.bedQuantity,
          bookedAt: booking.bookedAt,
        }))
    );

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
}


static async getVendorProfile(req: Request, res: Response, next: NextFunction) {
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

    res.status(200).json({
      vendorname: vendor.name,
      email: vendor.email,
      contact: vendor.contact,
    });
  } catch (error) {
    next(error);
  }
}

static async getVendorId(req: Request, res: Response, next: NextFunction) {
  try {
    const vendorId = req.body.vendorId; 
    res.status(200).json({ vendorId });
  } catch (error) {
    next(error);
  }
}
  

}



export { errorHandler };
