// src/presentation/middlewares/CheckUserBlockStatusMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

const userRepository = new UserRepository();

export const CheckUserBlockStatusMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const userEmail = (decoded as any).email;

    const user = await userRepository.findUserByEmail(userEmail);
    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.isBlocked) {
      return res.status(403).send('User is blocked');
    }

    next();
  } catch (error) {
    return res.status(401).send('Invalid token');
  }
};
