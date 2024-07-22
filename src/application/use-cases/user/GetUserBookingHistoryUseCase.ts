// src/application/use-cases/user/GetUserBookingHistoryUseCase.ts

import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class GetUserBookingHistoryUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userEmail: string): Promise<any[]> {
    return await this.userRepository.getUserBookingHistory(userEmail);
  }
}
