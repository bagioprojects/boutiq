import bcrypt from 'bcrypt';
import type { PrismaClient } from '@prisma/client';
import type { ICacheService } from '../cache/cache.service';
import { JwtService } from './jwt.service';
import { UnauthorizedError } from '../types/errors';
import { ok, err } from '../types/result';
import type { Result } from '../types/result';
import type { StaffId } from '../types/branded';
import { toStaffId } from '../types/branded';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface StaffPrincipal {
  id: StaffId;
  email: string;
  permissions: string[];
}

export class AuthService {
  private readonly BCRYPT_ROUNDS = 12;
  private readonly SESSION_TTL = 7 * 24 * 60 * 60; // 7 gün

  constructor(
    private readonly db: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly cache: ICacheService,
  ) {}

  async login(dto: LoginDTO): Promise<Result<AuthTokens>> {
    const staff = await this.db.staff.findUnique({
      where: { email: dto.email, isActive: true },
    });

    if (!staff) return err(new UnauthorizedError('Invalid credentials'));

    const isValid = await bcrypt.compare(dto.password, staff.passwordHash);
    if (!isValid) return err(new UnauthorizedError('Invalid credentials'));

    await this.db.staff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = this.jwtService.sign({
      sub: toStaffId(staff.id),
      email: staff.email,
      permissions: staff.permissions,
    });

    const refreshToken = this.jwtService.sign({
      sub: toStaffId(staff.id),
      email: staff.email,
      permissions: [],
    });

    await this.cache.set(
      `session:${staff.id}`,
      { staffId: staff.id, refreshToken },
      { ttl: this.SESSION_TTL, tags: [`staff:${staff.id}`] },
    );

    return ok({ accessToken, refreshToken, expiresIn: this.SESSION_TTL });
  }

  async logout(staffId: StaffId): Promise<void> {
    await this.cache.invalidateByTag(`staff:${staffId}`);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  async createStaff(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissions: string[];
  }): Promise<Result<StaffPrincipal>> {
    const existing = await this.db.staff.findUnique({ where: { email: data.email } });
    if (existing) return err(new UnauthorizedError('Email already exists'));

    const passwordHash = await this.hashPassword(data.password);
    const staff = await this.db.staff.create({
      data: { ...data, passwordHash },
    });

    return ok({ id: toStaffId(staff.id), email: staff.email, permissions: staff.permissions });
  }
}
