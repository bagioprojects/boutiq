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
      return NextResponse.json({ success: false, message: 'Oturum açılmadı.' }, { status: 401 });
    }

    const user = UserRepository.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: UserRepository.toSafeUser(user),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Oturum açılmadı.' }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, phone } = body;

    const trimmedName = (full_name || '').trim();
    const trimmedPhone = (phone || '').trim();

    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json({ success: false, message: 'Lütfen geçerli bir ad ve soyad giriniz.' }, { status: 400 });
    }

    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ success: false, message: 'Lütfen geçerli bir 10 haneli cep telefonu numarası giriniz.' }, { status: 400 });
    }

    // Check if phone belongs to someone else
    const cleanDigits = trimmedPhone.replace(/\D/g, '').slice(-10);
    const existingUsers = db.prepare('SELECT id, phone FROM users WHERE id != ?').all(userId) as any[];
    for (const u of existingUsers) {
      if (u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanDigits) {
        return NextResponse.json({ success: false, message: 'Bu telefon numarası başka bir hesaba aittir.' }, { status: 400 });
      }
    }

    db.prepare(`
      UPDATE users
      SET full_name = ?, phone = ?
      WHERE id = ?
    `).run(trimmedName, trimmedPhone, userId);

    const updatedUser = UserRepository.findById(userId);
    const safeUser = updatedUser ? UserRepository.toSafeUser(updatedUser) : null;

    const res = NextResponse.json({
      success: true,
      message: 'Profil bilgileriniz başarıyla güncellendi.',
      user: safeUser,
    });

    if (safeUser) {
      res.cookies.set('fk_user', encodeURIComponent(JSON.stringify(safeUser)), {
        httpOnly: false,
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

