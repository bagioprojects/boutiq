import type { PrismaClient } from '@prisma/client';
import type { LocationId, VariantId } from '../../../core/types/branded';

export interface FulfillmentFulfillableItem {
  variantId: VariantId;
  quantity: number;
}

export interface SplitFulfillmentRoute {
  locationId: LocationId;
  items: Array<{
    variantId: VariantId;
    quantity: number;
  }>;
}

export class MultiLocationRoutingService {
  constructor(private readonly db: PrismaClient) {}

  async resolveRouting(items: FulfillmentFulfillableItem[]): Promise<SplitFulfillmentRoute[]> {
    const locations = await this.db.location.findMany({
      where: { isActive: true, fulfillsOnlineOrders: true },
      include: {
        inventoryLevels: {
          where: {
            variantId: { in: items.map((i) => i.variantId) },
          },
        },
      },
    });

    const routes: SplitFulfillmentRoute[] = [];
    const remainingNeeds = new Map(items.map((i) => [i.variantId, i.quantity]));

    // 1. Adım: Tüm siparişi tek depodan karşılayabilen depo var mı?
    for (const loc of locations) {
      let canFulfillAll = true;
      for (const item of items) {
        const lvl = loc.inventoryLevels.find((l) => l.variantId === item.variantId);
        const available = (lvl?.onHandQuantity ?? 0) - (lvl?.committedQuantity ?? 0);
        if (available < item.quantity) {
          canFulfillAll = false;
          break;
        }
      }

      if (canFulfillAll) {
        return [
          {
            locationId: loc.id as LocationId,
            items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          },
        ];
      }
    }

    // 2. Adım: Parçalı sevk (Split Fulfillment)
    for (const loc of locations) {
      const locItems: Array<{ variantId: VariantId; quantity: number }> = [];

      for (const [variantId, neededQty] of remainingNeeds.entries()) {
        if (neededQty <= 0) continue;

        const lvl = loc.inventoryLevels.find((l) => l.variantId === variantId);
        const available = (lvl?.onHandQuantity ?? 0) - (lvl?.committedQuantity ?? 0);

        if (available > 0) {
          const allocateQty = Math.min(available, neededQty);
          locItems.push({ variantId, quantity: allocateQty });
          remainingNeeds.set(variantId, neededQty - allocateQty);
        }
      }

      if (locItems.length > 0) {
        routes.push({
          locationId: loc.id as LocationId,
          items: locItems,
        });
      }
    }

    return routes;
  }
}

