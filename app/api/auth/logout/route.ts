import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({
    success: true,
    message: 'Oturum başarıyla kapatıldı.',
  });

  res.cookies.set('fk_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  res.cookies.set('fk_user', '', {
    httpOnly: false,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return res;
}

