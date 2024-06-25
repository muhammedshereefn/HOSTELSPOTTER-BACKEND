import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class DeleteUserUseCase {
    constructor(private userRepository : IUserRepository) {}

    async execute(userId:string):Promise<void>{
        await this.userRepository.deleteUser(userId);
    }
}