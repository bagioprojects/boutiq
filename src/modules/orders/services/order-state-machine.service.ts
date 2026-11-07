import type { PrismaClient } from '@prisma/client';
import { ok, err } from '../../../core/types/result';
import type { Result } from '../../../core/types/result';
import { AppError, NotFoundError } from '../../../core/types/errors';
import type { OrderId } from '../../../core/types/branded';
import type { ICacheService } from '../../../core/cache/cache.service';

type OrderStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'ARCHIVED'
  | 'CANCELLED';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['AUTHORIZED', 'CANCELLED'],
  AUTHORIZED: ['PAID', 'CANCELLED'],
  PAID: ['PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED'],
  PARTIALLY_FULFILLED: ['FULFILLED', 'CANCELLED'],
  FULFILLED: ['ARCHIVED'],
  ARCHIVED: [],
  CANCELLED: [],
};

export class OrderStateMachineService {
  constructor(
    private readonly db: PrismaClient,
    private readonly cache: ICacheService,
  ) {}

  async transition(
    orderId: OrderId,
    newStatus: OrderStatus,
    actorId: string,
    note?: string,
  ): Promise<Result<void>> {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) return err(new NotFoundError('Sipariş', orderId));

    const currentStatus = order.status as OrderStatus;
    const allowed = VALID_TRANSITIONS[currentStatus];

    if (!allowed.includes(newStatus)) {
      return err(
        new AppError(
          'INVALID_TRANSITION',
          `Sipariş durumu ${currentStatus} -> ${newStatus} geçişine izin verilmiyor`,
          422,
        ),
      );
    }

    await this.db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    await this.db.orderTimeline.create({
      data: {
        orderId,
        verb: 'STATUS_CHANGED',
        message: `Sipariş durumu ${currentStatus} -> ${newStatus} olarak güncellendi${note ? `: ${note}` : ''}`,
        actorId,
        actorType: 'staff',
      },
    });

    await this.cache.invalidateByTags([`order:${orderId}`]);

    return ok(undefined);
  }

  async cancelOrder(orderId: OrderId, reason: string, actorId: string): Promise<Result<void>> {
    const result = await this.transition(orderId, 'CANCELLED', actorId, reason);
    if (!result.ok) return result;

    await this.db.order.update({
      where: { id: orderId },
      data: { cancelledAt: new Date(), cancelReason: reason },
    });

    return ok(undefined);
  }
}

