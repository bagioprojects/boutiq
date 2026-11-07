import type { PrismaClient } from '@prisma/client';

export interface TrackEventInput {
  sessionId: string;
  customerId?: string;
  event: 'page_view' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'search';
  properties?: Record<string, unknown>;
  url?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
}

export class AnalyticsService {
  constructor(private readonly db: PrismaClient) {}

  async track(input: TrackEventInput): Promise<void> {
    await this.db.analyticsEvent.create({
      data: {
        sessionId: input.sessionId,
        customerId: input.customerId,
        event: input.event,
        properties: input.properties as any,
        url: input.url,
        referrer: input.referrer,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        country: input.country || 'TR',
      },
    });
  }

  async getActiveVisitorsCount(windowMinutes = 5): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    const result = await this.db.analyticsEvent.groupBy({
      by: ['sessionId'],
      where: { createdAt: { gte: since } },
    });
    return result.length;
  }
}

