import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Lütfen oturum açınız.' }, { status: 401 });
    }

    const body = await req.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return NextResponse.json(
        { success: false, message: 'Mevcut şifre ve yeni şifre gereklidir.' },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Yeni şifreniz en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    const user = UserRepository.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    if (user.password_hash) {
      const match = bcrypt.compareSync(current_password, user.password_hash);
      if (!match) {
        return NextResponse.json(
          { success: false, message: 'Mevcut şifrenizi hatalı girdiniz.' },
          { status: 400 }
        );
      }
    }

    const newHash = bcrypt.hashSync(new_password, 10);
    UserRepository.updatePassword(userId, newHash);

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla değiştirildi.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

