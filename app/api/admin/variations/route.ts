import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SessionService } from '@/src/core/security/session.service';
import { VariationEntity } from '@/src/models/entities/settings.entity';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('fk_admin_token')?.value || req.cookies.get('fk_token')?.value;
  if (!token) return false;
  const payload = SessionService.verifyToken(token);
  return !!(payload && payload.role === 'admin');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const group = searchParams.get('group');

    let query = 'SELECT * FROM variations';
    const params: any[] = [];

    if (group && group !== 'all') {
      query += ' WHERE group_name = ?';
      params.push(group);
    }

    query += ' ORDER BY group_name ASC, sort_order ASC, id ASC';

    const rows = db.prepare(query).all(...params) as VariationEntity[];
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Sadece yöneticiler varyasyon ekleyebilir.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { group_name, value, color_hex, sort_order, is_active } = body;

    if (!group_name || !value || !value.trim()) {
      return NextResponse.json(
        { success: false, message: 'Varyasyon grubu ve değeri zorunludur.' },
        { status: 400 }
      );
    }

    const cleanGroup = group_name.trim();
    const cleanValue = value.trim();
    const cleanHex = cleanGroup === 'Renk' && color_hex ? color_hex.trim() : null;
    const orderNum = Number(sort_order) || 1;
    const activeNum = is_active !== undefined ? (is_active ? 1 : 0) : 1;

    const stmt = db.prepare(`
      INSERT INTO variations (group_name, value, color_hex, sort_order, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(cleanGroup, cleanValue, cleanHex, orderNum, activeNum);
    const newId = Number(result.lastInsertRowid);

    const inserted = db.prepare('SELECT * FROM variations WHERE id = ?').get(newId) as VariationEntity;

    return NextResponse.json({
      success: true,
      message: 'Varyasyon başarıyla eklendi.',
      data: inserted,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Sadece yöneticiler varyasyon düzenleyebilir.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, group_name, value, color_hex, sort_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Varyasyon ID zorunludur.' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM variations WHERE id = ?').get(Number(id)) as VariationEntity;
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Varyasyon bulunamadı.' }, { status: 404 });
    }

    const updatedGroup = group_name ? group_name.trim() : existing.group_name;
    const updatedValue = value ? value.trim() : existing.value;
    const updatedHex = updatedGroup === 'Renk'
      ? (color_hex !== undefined ? color_hex?.trim() || null : existing.color_hex)
      : null;
    const updatedOrder = sort_order !== undefined ? Number(sort_order) : existing.sort_order;
    const updatedActive = is_active !== undefined ? (is_active ? 1 : 0) : (existing.is_active ?? 1);

    db.prepare(`
      UPDATE variations
      SET group_name = ?, value = ?, color_hex = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `).run(updatedGroup, updatedValue, updatedHex, updatedOrder, updatedActive, Number(id));

    const updated = db.prepare('SELECT * FROM variations WHERE id = ?').get(Number(id)) as VariationEntity;

    return NextResponse.json({
      success: true,
      message: 'Varyasyon başarıyla güncellendi.',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Sadece yöneticiler varyasyon silebilir.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Silinecek varyasyon ID gereklidir.' }, { status: 400 });
    }

    db.prepare('DELETE FROM variations WHERE id = ?').run(Number(id));

    return NextResponse.json({
      success: true,
      message: 'Varyasyon başarıyla silindi.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

