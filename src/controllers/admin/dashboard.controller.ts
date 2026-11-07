import { OrderRepository } from '@/src/models/repositories/order.repository';
import { ProductRepository } from '@/src/models/repositories/product.repository';
import { AdminDashboardViewModel } from '@/src/models/dtos';

export class AdminDashboardController {
  public static async getDashboardViewModel(): Promise<AdminDashboardViewModel> {
    const totalRevenue = OrderRepository.getRevenueTotal();
    const totalOrders = OrderRepository.getCount();
    const activeProducts = ProductRepository.getCount();
    const pendingReturns = OrderRepository.getPendingReturnsCount();
    const recentOrders = OrderRepository.getRecent(5);

    return {
      totalRevenue,
      totalRevenueFormatted: `${totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`,
      totalOrders,
      activeProducts,
      pendingReturns,
      recentOrders,
    };
  }
}

