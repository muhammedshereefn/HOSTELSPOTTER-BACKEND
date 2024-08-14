import { User } from "../entities/User";

export interface IUserRepository {
    createUser(user: User): Promise<void>;
    findUserByEmail(email: string): Promise<User | null>;
    updateUser(user: User): Promise<void>;

    getAllUsers(): Promise<User[]>;
    findUserById(id: string): Promise<User | null>;
    blockUser(userId: string): Promise<void>;
    unblockUser(userId: string): Promise<void>;
    deleteUser(userId:string):Promise<void>;
    addBookingHistoryByEmail(email: string, bookingDetails: any): Promise<void>;
    getUserBookingHistory(userEmail: string): Promise<any[]>;
    countUsers(): Promise<number>;
    addFavoriteHostel(userId: string, propertyId: string, propertyName: string): Promise<void>;

  }

  