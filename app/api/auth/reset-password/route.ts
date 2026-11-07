import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@/src/models/repositories/user.repository';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, newPassword } = body;

    const actualIdentifier = (identifier || '').trim();
    const actualPassword = (newPassword || '').trim();

    if (!actualIdentifier) {
      return NextResponse.json(
        { success: false, message: 'Lütfen kayıtlı e-posta adresinizi veya telefon numaranızı giriniz.' },
        { status: 400 }
      );
    }

    if (!actualPassword || actualPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Yeni şifreniz en az 6 karakterden oluşmalıdır.' },
        { status: 400 }
      );
    }

    const user = UserRepository.findByIdentifier(actualIdentifier);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Bu e-posta veya telefon ile kayıtlı bir hesap bulunamadı.' },
        { status: 404 }
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(actualPassword, salt);
    UserRepository.updatePassword(user.id, hash);

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Şifre sıfırlanırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

