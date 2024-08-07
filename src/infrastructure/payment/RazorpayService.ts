import Razorpay from 'razorpay';
import crypto from 'crypto';
import { AppError } from '../../errors/AppError';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID! || "rzp_test_Vz3Fdh1bVQWYj8",
  key_secret: process.env.RAZORPAY_KEY_SECRET! || "iqh0x4CGZ2mHJ7CTgrgfvgCo",
});

export const createOrder = async (amount: number, currency: string) => {
  const options = {
    amount: amount * 100,
    currency,
    receipt: `receipt_${Date.now()}`,
  };
  return await razorpayInstance.orders.create(options);
};

export const verifyPaymentSignature = (orderId: string, paymentId: string, razorpaySignature: string): boolean => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new AppError('Razorpay secret is not defined', 500);
  }
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');
  return expectedSignature === razorpaySignature;
};
