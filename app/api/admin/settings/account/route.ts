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

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, message: 'Yetkisiz işlem. Sadece yöneticiler hesap bilgilerini güncelleyebilir.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { companyName, email, phone } = body;

    if (!email || !companyName) {
      return NextResponse.json(
        { success: false, message: 'Şirket ünvanı ve yönetici e-posta adresi zorunludur.' },
        { status: 400 }
      );
    }

    // 1. Update store_profile
    db.prepare(`
      UPDATE store_profile
      SET store_name = ?, legal_title = ?, support_email = ?, support_phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(companyName, companyName, email, phone || '');

    // 2. Update admin user record in users table
    db.prepare(`
      UPDATE users
      SET email = ?, phone = ?
      WHERE role = 'admin'
    `).run(email, phone || null);

    return NextResponse.json({
      success: true,
      message: 'Hesap ve şirket profili başarıyla güncellendi.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

