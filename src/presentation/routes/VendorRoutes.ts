import express from 'express';
import { VendorController } from '../controllers/VendorController';
import { CheckVendorBlockedMiddleware } from '../middlewares/CheckVendorBlockedMiddleware';
import { CheckVendorBlockStatusMiddleware } from '../middlewares/CheckVendorBlockStatusMiddleware';
import { upload } from '../middlewares/multerMiddleware';
import { tokenVerify } from '../middlewares/tokenVerify';
const vendorRouter = express.Router();

//----------------SignIn&SignUP------------------------
vendorRouter.post('/signup', VendorController.signUp);
vendorRouter.post('/signin',CheckVendorBlockedMiddleware, VendorController.signIn);
vendorRouter.post('/verify-otp', VendorController.verifyOtp);
vendorRouter.post('/refresh-token', VendorController.refreshToken);
vendorRouter.post('/resend-otp', VendorController.resendOtp); 

//----------------Vendor Check------------------------
vendorRouter.get('/all',VendorController.getAllVendors)
vendorRouter.get('/check-block-status', CheckVendorBlockStatusMiddleware, VendorController.checkBlockStatus);
vendorRouter.get('/profile', tokenVerify, VendorController.getVendorProfile);
vendorRouter.get('/vendorId', tokenVerify, VendorController.getVendorId);

//----------------KYC----------------------------------
vendorRouter.post('/upload-kyc',upload.single('kycDocument'), VendorController.uploadKyc)

//----------------Property Handle------------------------
vendorRouter.post('/property',tokenVerify, VendorController.createProperty);
vendorRouter.get('/propertiesList',tokenVerify,VendorController.listProperties)
vendorRouter.delete('/property/:id',tokenVerify,VendorController.deleteProperty)
vendorRouter.put('/property/:id', tokenVerify, VendorController.updateProperty);
vendorRouter.get('/property/:id', tokenVerify, VendorController.getPropertyById);
vendorRouter.get('/property/:hostelName/bookings', tokenVerify, VendorController.getPropertyBookings);
vendorRouter.get('/bookings', tokenVerify, VendorController.getAllVendorBookings);


//----------------Subscribe&Payments------------------------
vendorRouter.post('/subscribe',tokenVerify,VendorController.createSubscriptionOrder)
vendorRouter.post('/verify-subscription', tokenVerify, VendorController.verifySubscription);
vendorRouter.post('/pay',tokenVerify,VendorController.createPropertyOrder)
vendorRouter.post('/verify-payment', tokenVerify, VendorController.verifyPropertyPayment);



vendorRouter.get('/:id', VendorController.getVendorById);


export default vendorRouter;

