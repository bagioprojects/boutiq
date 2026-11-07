import type { PrismaClient } from '@prisma/client';

export interface FunnelMetrics {
  views: number;
  cartAdds: number;
  checkouts: number;
  purchases: number;
  conversionRatePercent: number;
}

export class ConversionFunnelService {
  constructor(private readonly db: PrismaClient) {}

  async calculateFunnel(startDate: Date, endDate: Date): Promise<FunnelMetrics> {
    const events = await this.db.analyticsEvent.groupBy({
      by: ['event'],
      _count: { sessionId: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
        event: { in: ['page_view', 'add_to_cart', 'begin_checkout', 'purchase'] },
      },
    });

    const counts: Record<string, number> = {
      page_view: 0,
      add_to_cart: 0,
      begin_checkout: 0,
      purchase: 0,
    };

    for (const item of events) {
      counts[item.event] = item._count.sessionId;
    }

    const views = counts['page_view'] ?? 0;
    const purchases = counts['purchase'] ?? 0;
    const conversionRatePercent = views > 0 ? (purchases / views) * 100 : 0;

    return {
      views,
      cartAdds: counts['add_to_cart'] ?? 0,
      checkouts: counts['begin_checkout'] ?? 0,
      purchases,
      conversionRatePercent: parseFloat(conversionRatePercent.toFixed(2)),
    };
  }
}

