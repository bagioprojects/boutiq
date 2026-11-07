import type { PrismaClient } from '@prisma/client';

export interface SegmentCondition {
  field: 'order_count' | 'total_spent' | 'days_since_last_order' | 'tag' | 'country' | 'email_subscribed';
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'contains' | 'in_last';
  value: string | number;
  unit?: 'days' | 'months';
}

export interface SegmentDefinition {
  name: string;
  conditionsAnd: SegmentCondition[];
}

export class SegmentDslParserService {
  constructor(private readonly db: PrismaClient) {}

  async evaluateSegment(definition: SegmentDefinition): Promise<string[]> {
    const baseQuery = this.buildBaseQuery(definition.conditionsAnd);
    const customers = await this.db.customer.findMany({
      where: {
        ...baseQuery,
        deletedAt: null,
        state: 'ENABLED',
      },
      select: { id: true },
    });

    return customers.map((c) => c.id);
  }

  async computeRFM(customerId: string): Promise<{ recency: number; frequency: number; monetary: number }> {
    const orders = await this.db.order.findMany({
      where: { customerId, status: { notIn: ['CANCELLED'] } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    if (orders.length === 0) return { recency: 0, frequency: 0, monetary: 0 };

    const lastOrder = orders[0];
    if (!lastOrder) return { recency: 0, frequency: 0, monetary: 0 };

    const daysSinceLastOrder = Math.floor(
      (Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const recency = this.scoreRecency(daysSinceLastOrder);
    const frequency = this.scoreFrequency(orders.length);
    const monetary = this.scoreMonetary(totalSpent);

    return { recency, frequency, monetary };
  }

  private scoreRecency(days: number): number {
    if (days <= 30) return 5;
    if (days <= 60) return 4;
    if (days <= 90) return 3;
    if (days <= 180) return 2;
    return 1;
  }

  private scoreFrequency(orderCount: number): number {
    if (orderCount >= 10) return 5;
    if (orderCount >= 6) return 4;
    if (orderCount >= 3) return 3;
    if (orderCount >= 2) return 2;
    return 1;
  }

  private scoreMonetary(totalAmountKurus: number): number {
    if (totalAmountKurus >= 500000) return 5; // 5000 TL
    if (totalAmountKurus >= 200000) return 4; // 2000 TL
    if (totalAmountKurus >= 100000) return 3; // 1000 TL
    if (totalAmountKurus >= 50000) return 2;  // 500 TL
    return 1;
  }

  private buildBaseQuery(conditions: SegmentCondition[]): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    for (const condition of conditions) {
      switch (condition.field) {
        case 'email_subscribed':
          where['isEmailOptIn'] = condition.value === 'true' || condition.value === true;
          break;
        case 'tag':
          where['tags'] = { has: String(condition.value) };
          break;
        case 'country':
          where['addresses'] = {
            some: { country: String(condition.value) },
          };
          break;
        default:
          break;
      }
    }

    return where;
  }
}

