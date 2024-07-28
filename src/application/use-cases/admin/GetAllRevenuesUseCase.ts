// src/application/use-cases/admin/GetAllRevenuesUseCase.ts

import { IRevenueRepository } from '../../../domain/repositories/IRevenueRepository';

export class GetAllRevenuesUseCase {
  constructor(private revenueRepository: IRevenueRepository) {}

  async execute(page: number, limit: number) {
    return this.revenueRepository.getAllRevenues(page, limit);
  }
}
