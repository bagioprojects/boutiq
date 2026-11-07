import type { PrismaClient } from '@prisma/client';

export interface AuditLogParams {
  actorId: string;
  actorType: 'staff' | 'customer' | 'system' | 'webhook';
  action: string;
  targetType: string;
  targetId: string;
  changes?: Array<{ field: string; before: unknown; after: unknown }>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export class AuditLogService {
  constructor(private readonly db: PrismaClient) {}

  async record(params: AuditLogParams): Promise<void> {
    await this.db.staffAuditLog.create({ data: params });
  }

  async getHistory(targetType: string, targetId: string, limit = 50) {
    return this.db.staffAuditLog.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
