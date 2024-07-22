import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { VendorRepository } from '../../../infrastructure/repositories/VendorRepository';
import { PropertyRepository } from '../../../infrastructure/repositories/PropertyRepository';
import { RevenueRepository } from '../../../infrastructure/repositories/RevenueRepository';

export class GetDashboardCountsUseCase {
  constructor(
    private userRepository: UserRepository,
    private vendorRepository: VendorRepository,
    private propertyRepository: PropertyRepository,
    private revenueRepository: RevenueRepository
  ) {}

  async execute() {
    const totalUsers = await this.userRepository.countUsers();
    const totalVendors = await this.vendorRepository.countVendors();
    const totalProperties = await this.propertyRepository.countProperties();
    const totalPremiumVendors = await this.vendorRepository.countPremiumVendors(); 

    const totalPropertyRevenue = await this.revenueRepository.getTotalRevenueByType('property');
    const totalSubscriptionRevenue = await this.revenueRepository.getTotalRevenueByType('subscription');

    const monthlyPropertyRevenue = await this.revenueRepository.getMonthlyRevenueByType('property');
    const monthlySubscriptionRevenue = await this.revenueRepository.getMonthlyRevenueByType('subscription');

   

    const bookingCountsByState = await this.propertyRepository.findBookingCountsByState();

    return {
      totalUsers,
      totalVendors,
      totalProperties,
      totalPremiumVendors,
      totalPropertyRevenue,
      totalSubscriptionRevenue,
      monthlyPropertyRevenue,
      monthlySubscriptionRevenue,
      bookingCountsByState 
    };
  }
}
