import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SessionService } from '@/src/core/security/session.service';
import { UserRepository } from '@/src/models/repositories/user.repository';

export const dynamic = 'force-dynamic';

function getUserIdFromReq(req: NextRequest): number | null {
  const token = req.cookies.get('fk_token')?.value;
  if (!token) return null;
  const verified = SessionService.verifyToken(token);
  return verified ? verified.id : null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const user = UserRepository.findById(userId);
    if (!user) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const cleanUserPhone = user.phone ? user.phone.replace(/\D/g, '').slice(-10) : '';
    const cleanUserEmail = user.email.toLowerCase();

    // Query orders
    const allOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all() as any[];
    
    // Filter by user_id first (exact match), fallback to matching phone or customer_name for legacy orders
    const userOrders = allOrders.filter(o => {
      const isDirectUserMatch = o.user_id !== null && o.user_id !== undefined && Number(o.user_id) === Number(userId);
      if (isDirectUserMatch) return true;

      const orderPhone = (o.customer_phone || '').replace(/\D/g, '').slice(-10);
      const isPhoneMatch = cleanUserPhone && orderPhone && cleanUserPhone === orderPhone;
      const isNameMatch = o.customer_name && o.customer_name.toLowerCase() === user.full_name.toLowerCase();
      return isPhoneMatch || isNameMatch;
    });

    return NextResponse.json({
      success: true,
      orders: userOrders.map(o => ({
        id: o.id,
        order_number: o.order_number,
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        customer_city: o.customer_city,
        total_amount: o.total_amount,
        status: o.status,
        payment_method: o.payment_method,
        cargo_company: o.cargo_company || 'Yurtiçi Kargo',
        items: JSON.parse(o.items_json || '[]'),
        created_at: o.created_at,
        tracking_code: o.tracking_code,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

