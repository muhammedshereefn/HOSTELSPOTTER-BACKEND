// src/infrastructure/repositories/RevenueRepository.ts

import { Revenue } from '../../domain/entities/Revenue';
import { RevenueModel } from '../database/models/RevenueModel';
import { IRevenueRepository } from '../../domain/repositories/IRevenueRepository';

export class RevenueRepository implements IRevenueRepository {
  async createRevenue(revenue: Revenue): Promise<void> {
    const revenueModel = new RevenueModel(revenue);
    await revenueModel.save();
  }

   async getTotalRevenueByType(type: string): Promise<number> {
    const result = await RevenueModel.aggregate([
      { $match: { type } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getMonthlyRevenueByType(type: string): Promise<{ month: string, total: number }[]> {
    const result = await RevenueModel.aggregate([
      { $match: { type } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      {
        $project: {
          month: { $concat: [{ $toString: "$_id.month" }, "-", { $toString: "$_id.year" }] },
          total: 1,
          _id: 0
        }
      },
      { $sort: { "month": 1 } }
    ]);

    return result;
  }
}