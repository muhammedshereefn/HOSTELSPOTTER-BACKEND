// src/domain/repositories/IRevenueRepository.ts

import { Revenue } from '../../domain/entities/Revenue';

export interface IRevenueRepository {
  createRevenue(revenue: Revenue): Promise<void>;
  getTotalRevenueByType(type: string): Promise<number>;

}
