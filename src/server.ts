import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './presentation/routes/UserRoutes';
import vendorRoutes from './presentation/routes/VendorRoutes';
import adminRoutes from './presentation/routes/AdminRoutes';
import chatRoutes from './presentation/routes/ChatRoutes';
import { errorHandler } from './presentation/middlewares/errorMiddleware';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST' , 'PUT' , 'DELETE'],
  },
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is not defined');
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
}));
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api', adminRoutes);
app.use('/api/chats', chatRoutes);



app.use(errorHandler);


mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error: any) => console.log(error));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('send-message', (data) => {
    const { userId, vendorId, text, senderId } = data;
    const room = `chat-${userId}-${vendorId}`;
    io.to(room).emit('message', { senderId, text });
  });

  socket.on('join-chat', (data) => {
    const { userId, vendorId } = data;
    const room = `chat-${userId}-${vendorId}`;
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

export { io }; 

  

  
