import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@/src/models/repositories/user.repository';
import { SessionService } from '@/src/core/security/session.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, name, phone } = body;

    const actualName = (full_name || name || '').trim();
    const actualEmail = (email || '').trim().toLowerCase();
    const actualPassword = (password || '').trim();
    const actualPhone = (phone || '').trim();

    if (!actualName || actualName.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Lütfen geçerli bir ad soyad giriniz (en az 2 karakter).' },
        { status: 400 }
      );
    }

    if (!actualEmail || !actualEmail.includes('@') || !actualEmail.includes('.')) {
      return NextResponse.json(
        { success: false, message: 'Lütfen geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    if (!actualPassword || actualPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Şifreniz en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Telefon numarası zorunludur ve geçerli formatta olmalıdır
    if (!actualPhone) {
      return NextResponse.json(
        { success: false, message: 'Lütfen cep telefonu numaranızı giriniz.' },
        { status: 400 }
      );
    }

    const cleanPhoneDigits = actualPhone.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Lütfen 10 haneli geçerli bir cep telefonu numarası giriniz (5XX XXX XX XX).' },
        { status: 400 }
      );
    }

    // Check if email already in use
    const existing = UserRepository.findByEmail(actualEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Bu e-posta adresiyle kayıtlı bir hesap zaten mevcuttur. Lütfen giriş yapınız.' },
        { status: 400 }
      );
    }

    // Check if phone already in use
    const existingPhone = UserRepository.findByPhone(actualPhone);
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: 'Bu telefon numarasıyla kayıtlı bir hesap zaten mevcuttur.' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = bcrypt.hashSync(actualPassword, 10);

    // Create user
    const newUser = UserRepository.create({
      email: actualEmail,
      password_hash,
      full_name: actualName,
      phone: actualPhone || null,
      role: 'customer',
      auth_provider: 'local',
    });

    const safeUser = UserRepository.toSafeUser(newUser);
    const token = SessionService.signToken(safeUser);

    const res = NextResponse.json({
      success: true,
      user: safeUser,
      token,
      message: `Tebrikler ${safeUser.full_name}, üyeliğiniz başarıyla oluşturuldu!`,
    });

    // Set cookie headers
    res.cookies.set('fk_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookies.set('fk_user', encodeURIComponent(JSON.stringify(safeUser)), {
      httpOnly: false,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res;
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Kayıt işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}

