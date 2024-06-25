// src/application/use-cases/admin/BlockUserUseCase.ts
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class BlockUserUseCase {
    constructor(private userRepository: IUserRepository) {}

    async execute(userId: string): Promise<void> {
        await this.userRepository.blockUser(userId);
    }
}
