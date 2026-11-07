import { db } from '@/lib/db';
import { PaymentEntity, PaymentStatsSummary } from '../entities/payment.entity';

export class PaymentRepository {
  public static getAll(statusFilter?: string): PaymentEntity[] {
    let query = 'SELECT * FROM payments';
    const params: any[] = [];
    if (statusFilter) {
      query += ' WHERE payout_status LIKE ?';
      params.push(`%${statusFilter}%`);
    }
    query += ' ORDER BY id DESC';
    return db.prepare(query).all(...params) as PaymentEntity[];
  }

  public static getStats(): PaymentStatsSummary {
    const all = this.getAll();
    let gross = 0;
    let comm = 0;
    let net = 0;
    let pending = 0;

    for (const p of all) {
      gross += p.gross_amount;
      comm += p.commission_amount;
      net += p.net_amount;
      if ((p.payout_status || '').includes('Beklemede')) {
        pending += p.net_amount;
      }
    }

    return {
      grossTotal: gross,
      commissionTotal: comm,
      netTotal: net,
      pendingPayoutTotal: pending,
      transactionCount: all.length,
    };
  }
}

