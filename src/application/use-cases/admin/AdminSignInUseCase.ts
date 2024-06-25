import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export class AdminSignInUseCase {
    constructor(private adminRepository : IAdminRepository){}

    async execute(email:string, password:string): Promise<string>{
        const admin = await this.adminRepository.findAdminByEmail(email);
        if(!admin || !await bcrypt.compare(password,admin.password)){
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign({email:admin.email},process.env.JWT_SECRET!,{
            expiresIn:'1h'
        })

        return token
    }

}