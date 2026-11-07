import jwt from 'jsonwebtoken';
import { UserEntity, SafeUser } from '@/src/models/entities/user.entity';
import { UserRepository } from '@/src/models/repositories/user.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'fkbutik-super-secret-jwt-token-key-2026-production';
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SessionPayload {
  id: number;
  email: string;
  role: string;
  full_name: string;
  iat?: number;
  exp?: number;
}

export class SessionService {
  public static signToken(user: UserEntity | SafeUser): string {
    const payload: SessionPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE_SECONDS });
  }

  public static verifyToken(token: string): SessionPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  public static getUserFromToken(token: string): SafeUser | null {
    const payload = this.verifyToken(token);
    if (!payload || !payload.id) return null;
    const user = UserRepository.findById(payload.id);
    if (!user) return null;
    return UserRepository.toSafeUser(user);
  }

  public static getCookieHeaders(token: string, safeUser: SafeUser): Record<string, string> {
    const encodedUser = encodeURIComponent(JSON.stringify(safeUser));
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? 'Secure; ' : '';
    
    return {
      'Set-Cookie': [
        `fk_token=${token}; Path=/; Max-Age=${TOKEN_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax; ${secureFlag}`,
        `fk_user=${encodedUser}; Path=/; Max-Age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax; ${secureFlag}`,
      ].join(', '),
    };
  }

  public static getClearCookieHeaders(): Record<string, string> {
    return {
      'Set-Cookie': [
        'fk_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
        'fk_user=; Path=/; Max-Age=0; SameSite=Lax',
      ].join(', '),
    };
  }
}

