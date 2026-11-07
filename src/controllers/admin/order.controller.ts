import { OrderRepository } from '@/src/models/repositories/order.repository';
import { AdminOrdersViewModel, AdminReturnsViewModel } from '@/src/models/dtos';

export class AdminOrderController {
  public static async getAllOrdersViewModel(): Promise<AdminOrdersViewModel> {
    const orders = OrderRepository.getAll();
    return {
      orders,
      totalCount: orders.length,
    };
  }

  public static async getPendingOrdersViewModel(): Promise<AdminOrdersViewModel> {
    const orders = OrderRepository.getAll('Hazırlanıyor');
    return {
      orders,
      totalCount: orders.length,
      activeFilter: 'Hazırlanıyor',
    };
  }

  public static async getShippedOrdersViewModel(): Promise<AdminOrdersViewModel> {
    const orders = OrderRepository.getAll('Kargoya Verildi');
    return {
      orders,
      totalCount: orders.length,
      activeFilter: 'Kargoya Verildi',
    };
  }

  public static async getReturnsViewModel(): Promise<AdminReturnsViewModel> {
    const returns = OrderRepository.getAllReturns();
    return {
      returns,
      totalCount: returns.length,
    };
  }
}

