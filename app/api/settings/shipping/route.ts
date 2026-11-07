import { NextRequest, NextResponse } from 'next/server';
import { SettingsRepository } from '@/src/models/repositories/settings.repository';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const shopSettings = SettingsRepository.getShopSettings();
    const freeShippingLimit = parseFloat(shopSettings.free_shipping_limit || '1500') || 1500;
    const flatRate = parseFloat(shopSettings.flat_rate || '49.90') || 49.90;
    const carrier = shopSettings.carrier || 'Yurtiçi Kargo / MNG';

    return NextResponse.json({
      success: true,
      freeShippingLimit,
      flatRate,
      carrier,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, freeShippingLimit: 1500, flatRate: 49.9, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { free_shipping_limit, flat_rate, carrier } = body;

    const stmt = db.prepare(`
      INSERT INTO shop_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    if (free_shipping_limit !== undefined) {
      stmt.run('free_shipping_limit', String(free_shipping_limit).replace(/[^\d.]/g, ''));
    }
    if (flat_rate !== undefined) {
      stmt.run('flat_rate', String(flat_rate));
    }
    if (carrier !== undefined) {
      stmt.run('carrier', String(carrier));
    }

    return NextResponse.json({
      success: true,
      message: 'Kargo ayarları başarıyla kaydedildi.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Kargo ayarları kaydedilemedi.' },
      { status: 500 }
    );
  }
}

