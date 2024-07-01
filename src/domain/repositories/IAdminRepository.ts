import { Admin } from "../entities/Admin";

export interface IAdminRepository {
    createAdmin(admin : Admin): Promise<void>;
    findAdminByEmail(email:string): Promise<Admin | null>;
    updateAdmin(admin:Admin):Promise<void>;
}
