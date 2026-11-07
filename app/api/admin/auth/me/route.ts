import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/src/core/security/session.service';
import { UserRepository } from '@/src/models/repositories/user.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminToken = req.cookies.get('fk_admin_token')?.value || req.cookies.get('fk_token')?.value;

    if (!adminToken) {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'Oturum bulunamadı.' },
        { status: 401 }
      );
    }

    const payload = SessionService.verifyToken(adminToken);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'Geçersiz oturum.' },
        { status: 401 }
      );
    }

    const user = UserRepository.findById(payload.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'Yönetici yetkisi bulunmuyor.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: UserRepository.toSafeUser(user),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, authenticated: false, message: error.message },
      { status: 500 }
    );
  }
}

