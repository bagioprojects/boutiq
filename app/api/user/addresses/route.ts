import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SessionService } from '@/src/core/security/session.service';

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
      return NextResponse.json({ success: true, addresses: [] });
    }

    const rows = db.prepare('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(userId) as any[];
    return NextResponse.json({
      success: true,
      addresses: rows.map(r => ({ ...r })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Lütfen oturum açınız.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, full_name, phone, city, district, full_address, zip_code, is_default } = body;

    if (!full_name || !phone || !city || !full_address) {
      return NextResponse.json(
        { success: false, message: 'Lütfen ad soyad, telefon, il ve açık adres alanlarını doldurunuz.' },
        { status: 400 }
      );
    }

    if (is_default) {
      db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    }

    const stmt = db.prepare(`
      INSERT INTO user_addresses (user_id, title, full_name, phone, city, district, full_address, zip_code, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      userId,
      title || 'Ev',
      full_name.trim(),
      phone.trim(),
      city.trim(),
      district?.trim() || '',
      full_address.trim(),
      zip_code?.trim() || '',
      is_default ? 1 : 0
    );

    return NextResponse.json({
      success: true,
      id: Number(result.lastInsertRowid),
      message: 'Adres başarıyla kaydedildi.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Adres kaydedilemedi.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Lütfen oturum açınız.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, full_name, phone, city, district, full_address, zip_code, is_default } = body;

    if (!id || !full_name || !phone || !city || !full_address) {
      return NextResponse.json(
        { success: false, message: 'Eksik adres bilgisi.' },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const existing = db.prepare('SELECT id FROM user_addresses WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Adres bulunamadı.' }, { status: 404 });
    }

    if (is_default) {
      db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    }

    db.prepare(`
      UPDATE user_addresses
      SET title = ?, full_name = ?, phone = ?, city = ?, district = ?, full_address = ?, zip_code = ?, is_default = ?
      WHERE id = ? AND user_id = ?
    `).run(
      title || 'Ev',
      full_name.trim(),
      phone.trim(),
      city.trim(),
      district?.trim() || '',
      full_address.trim(),
      zip_code?.trim() || '',
      is_default ? 1 : 0,
      id,
      userId
    );

    return NextResponse.json({
      success: true,
      message: 'Adres başarıyla güncellendi.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Adres güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Lütfen oturum açınız.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Adres ID belirtilmedi.' }, { status: 400 });
    }

    db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(Number(id), userId);

    return NextResponse.json({
      success: true,
      message: 'Adres başarıyla silindi.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Adres silinemedi.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Lütfen oturum açınız.' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Adres ID belirtilmedi.' }, { status: 400 });
    }

    db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    db.prepare('UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?').run(Number(id), userId);

    return NextResponse.json({
      success: true,
      message: 'Varsayılan adres güncellendi.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Varsayılan adres güncellenemedi.' }, { status: 500 });
  }
}
