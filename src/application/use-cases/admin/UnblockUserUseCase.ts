// src/application/use-cases/admin/UnblockUserUseCase.ts
import { IUserRepository } from "../../../domain/repositories/IUserRepository";


export class UnblockUserUseCase {
    constructor(private userRepository: IUserRepository){}

    async execute(userId:string): Promise<void>{
        await this.userRepository.unblockUser(userId)
    }
}