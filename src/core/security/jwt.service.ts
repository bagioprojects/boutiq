import jwt from 'jsonwebtoken';
import type { StaffId } from '../types/branded';
import { UnauthorizedError } from '../types/errors';
import type { Result } from '../types/result';
import { ok, err } from '../types/result';

export interface JwtPayload {
  sub: StaffId;
  email: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn = '7d') {
    if (!secret || secret.length < 16) {
      throw new Error('JWT secret en az 16 karakter olmalıdır');
    }
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    });
  }

  verify(token: string): Result<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return ok(decoded);
    } catch {
      return err(new UnauthorizedError('Geçersiz veya süresi dolmuş token'));
    }
  }

  decode(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}

