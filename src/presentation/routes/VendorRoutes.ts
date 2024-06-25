// src/presentation/routes/VendorRoutes.ts

import express from 'express';
import { VendorController } from '../controllers/VendorController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { CheckVendorBlockedMiddleware } from '../middlewares/CheckVendorBlockedMiddleware';
import { AdminContrller } from '../controllers/AdminController';
import { CheckVendorBlockStatusMiddleware } from '../middlewares/CheckVendorBlockStatusMiddleware';

const vendorRouter = express.Router();

vendorRouter.post('/signup', VendorController.signUp);
vendorRouter.post('/signin',CheckVendorBlockedMiddleware, VendorController.signIn);
vendorRouter.post('/verify-otp', VendorController.verifyOtp);
vendorRouter.post('/resend-otp', VendorController.resendOtp); 
vendorRouter.get('/all',VendorController.getAllVendors)
vendorRouter.get('/check-block-status', CheckVendorBlockStatusMiddleware, VendorController.checkBlockStatus);


// Routes protected by JWT middleware
vendorRouter.get('/protected-route', AuthMiddleware, (req, res) => {
  res.send('This is a protected route');
});

export default vendorRouter;

