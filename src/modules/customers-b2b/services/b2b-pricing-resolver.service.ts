import type { PrismaClient } from '@prisma/client';
import type { CurrencyCode } from '../../../core/domain/value-objects/money.vo';

export interface ResolvedPrice {
  amount: number;
  currency: CurrencyCode;
  isB2BPrice: boolean;
  priceListId?: string;
  minQuantity: number;
}

export class B2BPricingResolverService {
  constructor(private readonly db: PrismaClient) {}

  async resolvePrice(
    variantId: string,
    customerId: string,
    requestedQuantity: number,
    defaultPriceAmount: number,
    currency: CurrencyCode,
  ): Promise<ResolvedPrice> {
    const customer = await this.db.customer.findUnique({
      where: { id: customerId },
      select: { companyId: true },
    });

    if (!customer?.companyId) {
      return { amount: defaultPriceAmount, currency, isB2BPrice: false, minQuantity: 1 };
    }

    const company = await this.db.company.findUnique({
      where: { id: customer.companyId },
      select: { priceListId: true, minOrderAmount: true },
    });

    if (!company?.priceListId) {
      return { amount: defaultPriceAmount, currency, isB2BPrice: false, minQuantity: 1 };
    }

    // Miktar baremine göre en avantajlı fiyatı bul
    const entry = await this.db.priceListEntry.findFirst({
      where: {
        priceListId: company.priceListId,
        variantId,
        minQuantity: { lte: requestedQuantity },
      },
      orderBy: { minQuantity: 'desc' },
    });

    if (!entry) {
      return { amount: defaultPriceAmount, currency, isB2BPrice: false, minQuantity: 1 };
    }

    return {
      amount: entry.priceAmount,
      currency,
      isB2BPrice: true,
      priceListId: company.priceListId,
      minQuantity: entry.minQuantity,
    };
  }

  async getNetTerms(companyId: string): Promise<number | null> {
    const company = await this.db.company.findUnique({
      where: { id: companyId },
      select: { paymentTermsDays: true },
    });
    return company?.paymentTermsDays ?? null;
  }
}

