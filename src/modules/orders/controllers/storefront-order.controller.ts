import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../core/types/errors';

export class StorefrontOrderController extends BaseController {
  constructor(private readonly db: PrismaClient) {
    super();
  }

  async getOrderDetails(orderId: string, customerId?: string): Promise<ApiResponse<any>> {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      include: {
        lineItems: true,
        fulfillments: true,
      },
    });

    if (!order || (customerId && order.customerId !== customerId)) {
      return this.handleError(new NotFoundError('Sipariş', orderId));
    }

    return this.ok(order);
  }
}

