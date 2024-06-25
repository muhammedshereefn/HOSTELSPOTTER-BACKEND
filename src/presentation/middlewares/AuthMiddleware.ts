import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

const userRepository = new UserRepository();

export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send('Access denied');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };

    // Fetch the user from the database
    const user = await userRepository.findUserByEmail(decoded.email);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      return res.status(403).send('User is blocked');
    }

    // Attach user information to the request object
    (req as any).user = user;

    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
};
