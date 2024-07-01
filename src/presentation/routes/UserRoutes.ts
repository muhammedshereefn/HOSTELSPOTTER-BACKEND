// src/presentation/routes/UserRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { CheckUserBlockedMiddleware } from '../middlewares/CheckUserBlockedMiddleware';
import { CheckUserBlockStatusMiddleware } from '../middlewares/CheckUserBlockStatusMiddleware';


const router = Router();

router.post('/signup', UserController.signUp);
router.post('/signin',CheckUserBlockedMiddleware ,UserController.signIn);
router.post('/verify-otp', UserController.verifyOtp);
router.post('/resend-otp', UserController.resendOtp);
router.get('/all', UserController.getAllUsers);
router.get('/check-block-status', CheckUserBlockStatusMiddleware,UserController.checkBlockStatus)
router.get('/properties', UserController.getAllProperties);
router.get('/properties/:id',UserController.getPropertybyId)

export default router;
