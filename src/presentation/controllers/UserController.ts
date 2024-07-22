

import { NextFunction, Request, Response } from 'express';
import { SignUpUseCase } from '../../application/use-cases/user/SignUpUseCase';
import { SignInUseCase } from '../../application/use-cases/user/SignInUseCase';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { NodemailerService } from '../../infrastructure/mail/NodemailerService';
import { GetAllUsersUseCase } from '../../application/use-cases/user/GetAllUsersUseCase';
import { GetAllPropertiesUseCase } from '../../application/use-cases/property/GetAllPropertiesUseCase';
import { io } from '../../server';

import jwt from 'jsonwebtoken';
import { User } from '../../domain/entities/User';
import { PropertyRepository } from '../../infrastructure/repositories/PropertyRepository';
import { GetPropertyByIdUseCase } from '../../application/use-cases/property/GetPropertyByIdUseCase';
import { AppError } from '../../errors/AppError';
import { RefreshTokenUseCase } from '../../application/use-cases/user/RefreshTokenUseCase';
import { createOrder, verifyPaymentSignature } from '../../infrastructure/payment/RazorpayService';
import { GetUserBookingHistoryUseCase } from '../../application/use-cases/user/GetUserBookingHistoryUseCase';

const userRepository = new UserRepository();
const propertyRepository = new PropertyRepository()
const mailService = new NodemailerService();


const getAllPropertiesUseCase = new GetAllPropertiesUseCase(propertyRepository);
const getPropertyByIdUseCase = new GetPropertyByIdUseCase(propertyRepository);
const getUserBookingHistoryUseCase = new GetUserBookingHistoryUseCase(userRepository);


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




  static async getUserBookingHistory(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.params;

    try {
      const bookingHistory = await userRepository.getUserBookingHistoryById(userId);
      res.status(200).json(bookingHistory);
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
        console.log(properties);
        
        res.status(200).json(properties);
    } catch (error) {
      next(error);
    }
}

static async getPropertiesByState(req: Request, res: Response, next: NextFunction) {
  try {
    const state = req.params.state;
    const properties = await  propertyRepository.findPropertiesByState(state);
    res.status(200).json(properties);
} catch (error) {
    next(error);
}
}


static async getPropertiesGroupedByState(req: Request, res: Response, next: NextFunction) {
  try {
    const propertiesByState = await propertyRepository.findPropertiesGroupedByState();
    res.status(200).json(propertiesByState);
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





static async createSlotBookingOrder(req: Request, res: Response, next: NextFunction) {
  const { amount } = req.body;

  try {
    const order = await createOrder(amount, 'INR');
    res.status(201).json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    next(error);
  }
}


static async verifySlotBookingPayment(req: Request, res: Response, next: NextFunction) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, roomType, selectedBeds,userEmail } = req.body;

  try {
    const isValidSignature = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValidSignature) {
      throw new AppError('Invalid payment signature', 400);
    }

    // Update bed quantity
    const property = await propertyRepository.findPropertyByRoomType(roomType);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const room = property.roomBedQuantities.find((room: any) => room.roomName === roomType);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    room.bedQuantity -= selectedBeds.length;
    property.bookingCount += 1
    await propertyRepository.updatePropertyQ(property);


    // Find user by email
    const user = await userRepository.findUserByEmail(userEmail);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update user's booking history
    const bookingDetails = {
      hostelName: property.hostelName,
      hostelLocation: property.hostelLocation,
      roomName: roomType,
      bedQuantity: selectedBeds.length,
      bookedAt: new Date(),
    };

    await userRepository.addBookingHistoryByEmail(userEmail, bookingDetails);
    
    // Emit booking notification to vendor
    io.emit('newBooking', {
      userName: user.name,
      bedQuantity: selectedBeds.length,
      hostelName: property.hostelName,
    });

    res.status(200).json({ message: 'Payment successful' });
  } catch (error) {
    next(error);
  }
}

static async getBookingHistory(req: Request, res: Response, next: NextFunction) {
  const { userEmail } = req.body;  // Extract userEmail from req.body

  try {
    if (!userEmail) {
      throw new AppError('Email is required', 400);
    }
    const bookingHistory = await getUserBookingHistoryUseCase.execute(userEmail as string);
    res.status(200).json(bookingHistory);
  } catch (error) {
    next(error);
  }
}






//Profile
static async getUserProfile(req: Request, res: Response, next: NextFunction) {
  const { userEmail } = req.body;// Extracted from token using middleware

  try {
    const user = await userRepository.findUserByEmail(userEmail);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user profile data
    return res.status(200).json({
      username: user.name,
      email: user.email,
      contact: user.contact,
      wallet: {
        balance: user.wallet.balance,
        history: user.wallet.history,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}





// cancelBooking
static async cancelBooking(req: Request, res: Response, next: NextFunction) {
  const bookingId = req.params.id;
  const { userEmail } = req.body;

  try {
    const user = await userRepository.findUserByEmail(userEmail);
    if (!user) {
      throw new AppError('User not found', 404);
    }


    const booking = user.bookingHistory.find((b: any) => b._id.toString() === bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const bookingTime = new Date(booking.bookedAt);
    const currentTime = new Date();
    const timeDifference = (currentTime.getTime() - bookingTime.getTime()) / (1000 * 60); 

    if (timeDifference > 60) {
      throw new AppError('Cancellation time has expired', 400);
    }

    // Update property bed quantity
    const property = await propertyRepository.findPropertyByRoomType(booking.roomName);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const room = property.roomBedQuantities.find((r: any) => r.roomName === booking.roomName);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    room.bedQuantity += booking.bedQuantity;
    await propertyRepository.updatePropertyQ(property);

    // Update user wallet
    const refundAmount = booking.bedQuantity * 1000;
    user.wallet.balance += refundAmount;
    user.wallet.history.push({
      amount: refundAmount,
      transactionType: 'Refund',
      transactionDate: new Date(),
    });

    // Remove booking from history
    user.bookingHistory = user.bookingHistory.filter((b: any) => b._id.toString() !== bookingId);
    await userRepository.updateUser(user);



    // Emit cancellation notification to vendor
    io.emit('bookingCancelled', {
      userName: user.name,
      bedQuantity: booking.bedQuantity,
      hostelName: property.hostelName,
    });

    res.status(200).json({ message: 'Booking cancelled and refund processed' });
  } catch (error) {
    next(error);
  }
}




}
