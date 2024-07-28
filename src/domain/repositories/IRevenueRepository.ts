// src/domain/repositories/IRevenueRepository.ts

import { Revenue } from '../../domain/entities/Revenue';

export interface IRevenueRepository {
  createRevenue(revenue: Revenue): Promise<void>;
  getTotalRevenueByType(type: string): Promise<number>;
  getAllRevenues(page: number, limit: number): Promise<{ revenues: Revenue[], totalCount: number }>; // Add this line


}
