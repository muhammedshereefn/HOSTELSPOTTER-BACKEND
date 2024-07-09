// src/presentation/routes/VendorRoutes.ts

import express from 'express';
import { VendorController } from '../controllers/VendorController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { CheckVendorBlockedMiddleware } from '../middlewares/CheckVendorBlockedMiddleware';
import { AdminContrller } from '../controllers/AdminController';
import { CheckVendorBlockStatusMiddleware } from '../middlewares/CheckVendorBlockStatusMiddleware';
import { upload } from '../middlewares/multerMiddleware';
import { tokenVerify } from '../middlewares/tokenVerify';
const vendorRouter = express.Router();

vendorRouter.post('/signup', VendorController.signUp);
vendorRouter.post('/signin',CheckVendorBlockedMiddleware, VendorController.signIn);
vendorRouter.post('/verify-otp', VendorController.verifyOtp);
vendorRouter.post('/refresh-token', VendorController.refreshToken);
vendorRouter.post('/resend-otp', VendorController.resendOtp); 
vendorRouter.get('/all',VendorController.getAllVendors)
vendorRouter.get('/check-block-status', CheckVendorBlockStatusMiddleware, VendorController.checkBlockStatus);
vendorRouter.post('/upload-kyc',upload.single('kycDocument'), VendorController.uploadKyc)

vendorRouter.post('/property',tokenVerify, VendorController.createProperty);
vendorRouter.get('/propertiesList',tokenVerify,VendorController.listProperties)
vendorRouter.delete('/property/:id',tokenVerify,VendorController.deleteProperty)

vendorRouter.put('/property/:id', tokenVerify, VendorController.updateProperty);
vendorRouter.get('/property/:id', tokenVerify, VendorController.getPropertyById);

vendorRouter.post('/subscribe',tokenVerify,VendorController.createSubscriptionOrder)
vendorRouter.post('/verify-subscription', tokenVerify, VendorController.verifySubscription);


vendorRouter.post('/pay',tokenVerify,VendorController.createPropertyOrder)
vendorRouter.post('/verify-payment', tokenVerify, VendorController.verifyPropertyPayment);


vendorRouter.get('/:id', VendorController.getVendorById);


// // Routes protected by JWT middleware
// vendorRouter.get('/protected-route', AuthMiddleware, (req, res) => {
//   res.send('This is a protected route');
// });

export default vendorRouter;

