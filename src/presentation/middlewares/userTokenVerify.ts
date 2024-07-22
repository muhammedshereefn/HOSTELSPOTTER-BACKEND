import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const userTokenVerify = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "No Token provided" });
    }

    try {
        const secretKey = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secretKey) as { email: string };
        req.body.userEmail = decoded.email;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
