import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import { Admin } from "../../../domain/entities/Admin";
import bcrypt from 'bcrypt';


export class AdminSignUpUseCase {
    constructor(private adminRepository : IAdminRepository) {}

    async execute(name:string, email:string, password:string): Promise<void>{
        const existingAdmin = await this.adminRepository.findAdminByEmail(email);
        if(existingAdmin){
            throw new Error("Admin alredy exist");
        }

        const hashedPassword = await bcrypt.hash(password,10)
        const admin = new Admin(name,email,hashedPassword);

        await this.adminRepository.createAdmin(admin);
    }
}