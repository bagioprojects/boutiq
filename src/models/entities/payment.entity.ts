export interface PaymentEntity {
  id: number;
  transaction_id: string;
  order_number: string;
  customer_name: string;
  payment_method: string;
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  payout_status: string;
  payout_date?: string | null;
  created_at: string;
}

export interface PaymentStatsSummary {
  grossTotal: number;
  commissionTotal: number;
  netTotal: number;
  pendingPayoutTotal: number;
  transactionCount: number;
}

