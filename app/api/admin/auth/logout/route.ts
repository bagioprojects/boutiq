import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({
    success: true,
    message: 'Yönetici oturumu başarıyla kapatıldı.',
  });

  res.cookies.set('fk_admin_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  res.cookies.set('fk_admin_user', '', {
    httpOnly: false,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return res;
}

