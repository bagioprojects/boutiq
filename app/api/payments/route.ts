import { NextResponse } from 'next/server';
import { PaymentRepository } from '@/src/models/repositories/payment.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payments = PaymentRepository.getAll();
    return NextResponse.json(payments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
