import { Router } from 'express';
import { sendMessage, fetchChats, fetchVendorChats } from '../controllers/ChatController';

const router = Router();

//-------------------CHAT ROUTES---------------------------
router.post('/send-message', sendMessage);
router.get('/fetch-chats/:userId/:vendorId', fetchChats);
router.get('/fetch-vendor-chats/:vendorId', fetchVendorChats); 

export default router;
