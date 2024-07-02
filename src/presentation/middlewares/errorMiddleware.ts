import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError';
export const errorHandler = (
  error: AppError | Error, 
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error caught by middleware:', error);

  if (error instanceof AppError) {
    // Operational error: trusted error we know we can show to client
    res.status(error.statusCode).json({ message: error.message });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(500).json({ message: 'An unknown error occurred' });
  }
};
