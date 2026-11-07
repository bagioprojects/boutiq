import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@/src/models/repositories/user.repository';
import { SessionService } from '@/src/core/security/session.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, email, password } = body;

    const actualIdentifier = (identifier || email || '').trim();
    const actualPassword = (password || '').trim();

    if (!actualIdentifier) {
      return NextResponse.json(
        { success: false, message: 'Lütfen e-posta adresinizi veya telefon numaranızı giriniz.' },
        { status: 400 }
      );
    }

    if (!actualPassword) {
      return NextResponse.json(
        { success: false, message: 'Lütfen şifrenizi giriniz.' },
        { status: 400 }
      );
    }

    const user = UserRepository.findByIdentifier(actualIdentifier);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Girdiğiniz bilgilere ait kullanıcı bulunamadı. Lütfen bilgilerinizi kontrol ediniz veya üye olunuz.' },
        { status: 401 }
      );
    }

    // Verify password
    let passwordValid = false;
    if (user.password_hash) {
      try {
        passwordValid = bcrypt.compareSync(actualPassword, user.password_hash);
      } catch (err) {
        // If bcrypt fails to compare, try direct fallback
        passwordValid = false;
      }
    } else {
      // If no password_hash set (e.g. initial demo account), accept default test password '123456'
      if (actualPassword === '123456') {
        passwordValid = true;
        // Also save hash for future logins
        const newHash = bcrypt.hashSync(actualPassword, 10);
        UserRepository.updatePassword(user.id, newHash);
      }
    }

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: 'Hatalı şifre girdiniz. Lütfen tekrar deneyiniz.' },
        { status: 401 }
      );
    }

    UserRepository.updateLastLogin(user.id);
    const safeUser = UserRepository.toSafeUser(user);
    const token = SessionService.signToken(safeUser);

    const res = NextResponse.json({
      success: true,
      user: safeUser,
      token,
      message: `Hoş geldiniz, ${safeUser.full_name}!`,
    });

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
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Giriş yapılırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

