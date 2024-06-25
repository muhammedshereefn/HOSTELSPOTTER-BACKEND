import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import { Admin } from "../../domain/entities/Admin";
import { AdminModel } from "../database/models/AdminModel";


export class AdminRepository implements IAdminRepository {
    async createAdmin(admin: Admin): Promise<void> {
        const adminModel = new AdminModel(admin);
        await adminModel.save();
    }


    async findAdminByEmail(email: string): Promise<Admin | null> {
        const admin = await AdminModel.findOne({email}).lean();
        if(!admin) return null;

        return new Admin(admin.name,admin.email,admin.password);
    }


    async  updateAdmin(admin: Admin): Promise<void> {
        await AdminModel.updateOne({email:admin.email},admin);
    }
}