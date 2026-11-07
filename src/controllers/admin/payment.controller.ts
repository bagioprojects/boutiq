import { PaymentRepository } from '@/src/models/repositories/payment.repository';
import { AdminPaymentsViewModel } from '@/src/models/dtos';

export class AdminPaymentController {
  public static async getPaymentsViewModel(statusFilter?: string): Promise<AdminPaymentsViewModel> {
    const payments = PaymentRepository.getAll(statusFilter);
    const stats = PaymentRepository.getStats();

    return {
      payments,
      stats,
    };
  }

  public static async getPayoutsViewModel(): Promise<AdminPaymentsViewModel> {
    const payments = PaymentRepository.getAll('Aktarıldı');
    const stats = PaymentRepository.getStats();

    return {
      payments,
      stats,
    };
  }

  public static async getPendingPaymentsViewModel(): Promise<AdminPaymentsViewModel> {
    const payments = PaymentRepository.getAll('Beklemede');
    const stats = PaymentRepository.getStats();

    return {
      payments,
      stats,
    };
  }
}

