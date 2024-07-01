import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './presentation/routes/UserRoutes';
import vendorRoutes from './presentation/routes/VendorRoutes';
import adminRoutes from './presentation/routes/AdminRoutes'
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is not defined');
}


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(express.json()); 
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api',adminRoutes);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error: any) => console.log(error));

  
  
  

  