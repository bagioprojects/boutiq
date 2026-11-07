import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/src/models/repositories/user.repository';
import { SessionService } from '@/src/core/security/session.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || 'kullanici.google@gmail.com').trim().toLowerCase();
    const fullName = (body.name || 'Google Kullanıcısı').trim();

    let user = UserRepository.findByEmail(email);
    if (!user) {
      user = UserRepository.create({
        email,
        full_name: fullName,
        role: 'customer',
        auth_provider: 'google',
        password_hash: null,
      });
    } else {
      UserRepository.updateLastLogin(user.id);
    }

    const safeUser = UserRepository.toSafeUser(user);
    const token = SessionService.signToken(safeUser);

    const res = NextResponse.json({
      success: true,
      user: safeUser,
      token,
      message: `Google ile güvenli giriş yapıldı. Hoş geldiniz, ${safeUser.full_name}!`,
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
    console.error('Google Auth API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Google ile giriş başarısız oldu.' },
      { status: 500 }
    );
  }
}

