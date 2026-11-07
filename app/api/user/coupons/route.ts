import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const coupons = db.prepare('SELECT * FROM coupons WHERE is_active = 1 ORDER BY id DESC').all() as any[];
    return NextResponse.json({
      success: true,
      coupons: coupons.map(c => ({
        id: c.id,
        code: c.code,
        discount_type: c.discount_type,
        discount_value: c.discount_value,
        min_order_amount: c.min_order_amount,
        expires_at: c.expires_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

