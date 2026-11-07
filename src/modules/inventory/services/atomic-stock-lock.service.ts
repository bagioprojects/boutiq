import type { PrismaClient } from '@prisma/client';
import { InsufficientStockError } from '../../../core/types/errors';
import { ok, err } from '../../../core/types/result';
import type { Result } from '../../../core/types/result';
import type { VariantId, LocationId, CartId } from '../../../core/types/branded';

export interface StockReservation {
  id: string;
  variantId: VariantId;
  locationId: LocationId;
  quantity: number;
  cartId: CartId;
  expiresAt: Date;
}

export interface MinimalRedlock {
  acquire(resources: string[], ttl: number): Promise<{
    release(): Promise<void>;
  }>;
}

export class AtomicStockLockService {
  private readonly LOCK_TTL_MS = 5000;
  private readonly RESERVATION_DURATION_MS = 15 * 60 * 1000; // 15 dakika

  constructor(
    private readonly db: PrismaClient,
    private readonly redlock: MinimalRedlock,
  ) {}

  async reserveStock(
    variantId: VariantId,
    locationId: LocationId,
    quantity: number,
    cartId: CartId,
  ): Promise<Result<StockReservation>> {
    const lockKey = `stock:lock:${variantId}:${locationId}`;
    const lock = await this.redlock.acquire([lockKey], this.LOCK_TTL_MS);

    try {
      const level = await this.db.inventoryLevel.findUnique({
        where: { variantId_locationId: { variantId, locationId } },
        select: { onHandQuantity: true, committedQuantity: true },
      });

      const available = (level?.onHandQuantity ?? 0) - (level?.committedQuantity ?? 0);
      if (available < quantity) {
        return err(new InsufficientStockError(variantId, available, quantity));
      }

      await this.db.inventoryLevel.update({
        where: { variantId_locationId: { variantId, locationId } },
        data: { committedQuantity: { increment: quantity } },
      });

      await this.db.inventoryLedger.create({
        data: {
          variantId,
          locationId,
          delta: -quantity,
          reason: 'CART_RESERVATION',
          referenceId: cartId,
          referenceType: 'Cart',
        },
      });

      const reservation: StockReservation = {
        id: `res_${Date.now()}`,
        variantId,
        locationId,
        quantity,
        cartId,
        expiresAt: new Date(Date.now() + this.RESERVATION_DURATION_MS),
      };

      return ok(reservation);
    } finally {
      await lock.release();
    }
  }

  async releaseReservation(
    variantId: VariantId,
    locationId: LocationId,
    quantity: number,
    reason: string,
    referenceId: string,
  ): Promise<void> {
    await this.db.inventoryLevel.update({
      where: { variantId_locationId: { variantId, locationId } },
      data: { committedQuantity: { decrement: quantity } },
    });

    await this.db.inventoryLedger.create({
      data: {
        variantId,
        locationId,
        delta: quantity,
        reason,
        referenceId,
        referenceType: 'Reservation',
      },
    });
  }

  async deductStock(
    variantId: VariantId,
    locationId: LocationId,
    quantity: number,
    orderId: string,
  ): Promise<Result<void>> {
    const lockKey = `stock:lock:${variantId}:${locationId}`;
    const lock = await this.redlock.acquire([lockKey], this.LOCK_TTL_MS);

    try {
      await this.db.inventoryLevel.update({
        where: { variantId_locationId: { variantId, locationId } },
        data: {
          onHandQuantity: { decrement: quantity },
          committedQuantity: { decrement: quantity },
        },
      });

      await this.db.inventoryLedger.create({
        data: {
          variantId,
          locationId,
          delta: -quantity,
          reason: 'ORDER_FULFILLED',
          referenceId: orderId,
          referenceType: 'Order',
        },
      });

      return ok(undefined);
    } finally {
      await lock.release();
    }
  }
}

