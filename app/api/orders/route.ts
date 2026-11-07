import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/src/models/repositories/order.repository';
import { SessionService } from '@/src/core/security/session.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const orders = OrderRepository.getAll(status);
    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_city,
      total_amount,
      payment_method,
      cargo_company,
      items,
    } = body;

    if (!customer_name || !customer_phone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz sipariş verisi. Müşteri bilgileri ve ürünler gereklidir.' },
        { status: 400 }
      );
    }

    let userId: number | null = null;
    const token = req.cookies.get('fk_token')?.value;
    if (token) {
      const verified = SessionService.verifyToken(token);
      if (verified && verified.id) {
        userId = verified.id;
      }
    }

    const result = OrderRepository.createOrder({
      user_id: userId,
      customer_name,
      customer_phone,
      customer_city: customer_city || 'Belirtilmedi',
      total_amount: Number(total_amount) || 0,
      payment_method: payment_method || 'Kredi Kartı',
      cargo_company: cargo_company || 'Yurtiçi Kargo',
      status: 'Hazırlanıyor',
      items,
    });

    return NextResponse.json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu.',
      id: result.id,
      order_number: result.order_number,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, tracking_code } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Sipariş ID ve yeni durum zorunludur.' },
        { status: 400 }
      );
    }

    OrderRepository.updateStatus(Number(id), String(status), tracking_code);

    return NextResponse.json({
      success: true,
      message: 'Sipariş durumu güncellendi.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
