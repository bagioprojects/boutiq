import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SessionService } from '@/src/core/security/session.service';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('fk_admin_token')?.value || req.cookies.get('fk_token')?.value;
  if (!token) return false;
  const payload = SessionService.verifyToken(token);
  return !!(payload && payload.role === 'admin');
}

export async function GET(req: NextRequest) {
  try {
    const rows = db.prepare('SELECT key, value FROM shop_settings').all() as any[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, message: 'Yetkisiz erişim. Sadece yöneticiler mağaza ayarlarını değiştirebilir.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const settings = body.settings || body;

    const upsertStmt = db.prepare(`
      INSERT INTO shop_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    for (const [k, v] of Object.entries(settings)) {
      if (typeof v === 'string') {
        upsertStmt.run(k, v);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mağaza seçenekleri başarıyla kaydedildi.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

