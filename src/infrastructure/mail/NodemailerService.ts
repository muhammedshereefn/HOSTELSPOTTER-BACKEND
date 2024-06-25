import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


export class NodemailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
  }
  

  async sendOtp(email: string, otp: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
      };
  
      await this.transporter.sendMail(mailOptions);
      console.log('OTP sent successfully to:', email);
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }
  
}