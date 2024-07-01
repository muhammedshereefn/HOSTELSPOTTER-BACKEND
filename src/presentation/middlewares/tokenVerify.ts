import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const tokenVerify = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token:', token);

    if (!token) {
        return res.status(403).json({ message: "No Token provided" });
    }

    try {
        const secretKey = process.env.JWT_SECRET!;
        console.log("secretkey",secretKey);
        
        const decoded = jwt.verify(token, secretKey) as { vendorId: string };
        req.body.vendorId = decoded.vendorId;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

