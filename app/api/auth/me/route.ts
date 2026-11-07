import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/src/core/security/session.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const tokenCookie = req.cookies.get('fk_token')?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = tokenCookie || bearerToken;

    if (!token) {
      return NextResponse.json({ success: false, user: null, authenticated: false });
    }

    const safeUser = SessionService.getUserFromToken(token);
    if (!safeUser) {
      return NextResponse.json({ success: false, user: null, authenticated: false });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: safeUser,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, user: null, authenticated: false }, { status: 500 });
  }
}

