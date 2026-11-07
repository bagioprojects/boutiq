import type { PrismaClient } from '@prisma/client';
import { ok, err } from '../../../core/types/result';
import type { Result } from '../../../core/types/result';
import { AppError, NotFoundError } from '../../../core/types/errors';
import type { OrderId } from '../../../core/types/branded';

export interface FulfillmentItemInput {
  orderLineItemId: string;
  quantity: number;
}

export interface CreateFulfillmentInput {
  orderId: OrderId;
  locationId?: string;
  trackingCompany?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  items: FulfillmentItemInput[];
}

export class SplitFulfillmentService {
  constructor(private readonly db: PrismaClient) {}

  async createFulfillment(input: CreateFulfillmentInput): Promise<Result<{ fulfillmentId: string }>> {
    const order = await this.db.order.findUnique({
      where: { id: input.orderId },
      include: { lineItems: true },
    });

    if (!order) return err(new NotFoundError('Sipariş', input.orderId));

    // Kalemlerin karşılanabilirliğini kontrol et
    for (const item of input.items) {
      const lineItem = order.lineItems.find((li) => li.id === item.orderLineItemId);
      if (!lineItem) {
        return err(new NotFoundError('Sipariş Kalemi', item.orderLineItemId));
      }
      const unfulfilled = lineItem.quantity - lineItem.fulfilledQty;
      if (item.quantity > unfulfilled) {
        return err(
          new AppError('FULFILLMENT_EXCEEDED', `Talep edilen miktar (${item.quantity}) kalan karşılanmamış miktardan (${unfulfilled}) fazla`),
        );
      }
    }

    const fulfillment = await this.db.fulfillment.create({
      data: {
        orderId: input.orderId,
        locationId: input.locationId,
        status: 'SUCCESS',
        trackingCompany: input.trackingCompany,
        trackingNumber: input.trackingNumber,
        trackingUrl: input.trackingUrl,
        shippedAt: new Date(),
      },
    });

    for (const item of input.items) {
      await this.db.orderLineItem.update({
        where: { id: item.orderLineItemId },
        data: {
          fulfilledQty: { increment: item.quantity },
        },
      });
    }

    // Siparişin tüm kalemleri gönderildi mi?
    const updatedLineItems = await this.db.orderLineItem.findMany({
      where: { orderId: input.orderId },
    });

    const allFulfilled = updatedLineItems.every((li) => li.fulfilledQty >= li.quantity);
    const anyFulfilled = updatedLineItems.some((li) => li.fulfilledQty > 0);

    const newFulfillmentStatus = allFulfilled
      ? 'SUCCESS'
      : anyFulfilled
      ? 'OPEN'
      : 'PENDING';

    await this.db.order.update({
      where: { id: input.orderId },
      data: {
        fulfillmentStatus: newFulfillmentStatus,
        status: allFulfilled ? 'FULFILLED' : 'PARTIALLY_FULFILLED',
      },
    });

    return ok({ fulfillmentId: fulfillment.id });
  }
}

