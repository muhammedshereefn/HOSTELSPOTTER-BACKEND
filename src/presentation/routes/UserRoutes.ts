// src/presentation/routes/UserRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { CheckUserBlockedMiddleware } from '../middlewares/CheckUserBlockedMiddleware';
import { CheckUserBlockStatusMiddleware } from '../middlewares/CheckUserBlockStatusMiddleware';
import { userTokenVerify } from '../middlewares/userTokenVerify';


const router = Router();

router.post('/signup', UserController.signUp);
router.post('/signin',CheckUserBlockedMiddleware ,UserController.signIn);
router.post('/refresh-token', UserController.refreshToken);
router.post('/verify-otp', UserController.verifyOtp);
router.post('/resend-otp', UserController.resendOtp);
router.get('/all', UserController.getAllUsers);
router.get('/user/:userId/booking-history', UserController.getUserBookingHistory);
router.get('/check-block-status', CheckUserBlockStatusMiddleware,UserController.checkBlockStatus)
router.get('/properties', UserController.getAllProperties);

router.get('/properties/grouped-by-state',UserController.getPropertiesGroupedByState)
router.get('/properties/by-state/:state', UserController.getPropertiesByState);


router.get('/properties/:id',UserController.getPropertybyId);


router.post('/pay',userTokenVerify, UserController.createSlotBookingOrder);
router.post('/verify-payment',userTokenVerify, UserController.verifySlotBookingPayment);
router.get('/booking-history',userTokenVerify, UserController.getBookingHistory);
router.delete('/booking-history/:id', userTokenVerify, UserController.cancelBooking); 


router.get('/profile', userTokenVerify, UserController.getUserProfile);

export default router;

