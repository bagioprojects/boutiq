import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { AtomicStockLockService } from '../services/atomic-stock-lock.service';
import type { MultiLocationRoutingService, FulfillmentFulfillableItem } from '../services/multi-location-routing.service';
import { toVariantId, toLocationId, toCartId } from '../../../core/types/branded';

export class AdminInventoryController extends BaseController {
  constructor(
    private readonly stockLockService: AtomicStockLockService,
    private readonly routingService: MultiLocationRoutingService,
  ) {
    super();
  }

  async reserve(variantId: string, locationId: string, quantity: number, cartId: string): Promise<ApiResponse<any>> {
    const result = await this.stockLockService.reserveStock(
      toVariantId(variantId),
      toLocationId(locationId),
      quantity,
      toCartId(cartId),
    );
    return this.handleResult(result);
  }

  async calculateRouting(items: FulfillmentFulfillableItem[]): Promise<ApiResponse<any>> {
    const routes = await this.routingService.resolveRouting(items);
    return this.ok(routes);
  }
}

