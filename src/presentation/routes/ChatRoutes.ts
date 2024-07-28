// src/presentation/routes/ChatRoutes.ts

import { Router } from 'express';
import { sendMessage, fetchChats, fetchVendorChats } from '../controllers/ChatController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

router.post('/send-message', sendMessage);
router.get('/fetch-chats/:userId/:vendorId', fetchChats);
router.get('/fetch-vendor-chats/:vendorId', fetchVendorChats); 

export default router;
