

// src/infrastructure/repositories/UserRepository.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserModel } from '../database/models/UserModel';

export class UserRepository implements IUserRepository {
  async createUser(user: User): Promise<void> {
    const userModel = new UserModel(user);
    await userModel.save();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).lean();
    if (!user) return null;

    return new User(user.name, user.email, user.password, user.contact, user.otp ?? null, user.otpCreatedAt ?? null, user.isVerified,user.isBlocked);
  }

  async updateUser(user: User): Promise<void> {
    await UserModel.updateOne({ email: user.email }, user);
  }


  async getAllUsers(): Promise<User[]> {
    const users = await UserModel.find().lean();
    return users.map(user => new User(user.name, user.email, user.password, user.contact, user.otp ?? null, user.otpCreatedAt ?? null, user.isVerified,user.isBlocked,user._id.toString()));
  }
  



async findUserById(id: string): Promise<User | null> {
  const user = await UserModel.findById(id).lean();
  if (!user) return null;

  return new User(user.name, user.email, user.password, user.contact, user.otp ?? null, user.otpCreatedAt ?? null, user.isVerified, user.isBlocked);
}

async blockUser(userId: string): Promise<void> {
  await UserModel.updateOne({ _id: userId }, { $set: { isBlocked: true } });
}

async unblockUser(userId:string): Promise<void>{
  await UserModel.updateOne({_id:userId},{isBlocked:false});
}

async deleteUser(userId:string):Promise<void>{
  await UserModel.findByIdAndDelete(userId);
}
  
}
