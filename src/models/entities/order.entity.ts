export interface OrderEntity {
  id: number;
  order_number: string;
  user_id?: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_city: string;
  total_amount: number;
  payment_method: string;
  cargo_company?: string | null;
  status: string;
  tracking_code?: string | null;
  created_at: string;
}

export interface ReturnEntity {
  id: number;
  order_number: string;
  customer_name: string;
  reason: string;
  amount: number;
  status: string;
  created_at: string;
}

