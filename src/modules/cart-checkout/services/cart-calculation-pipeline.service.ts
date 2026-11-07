import type { PrismaClient } from '@prisma/client';
import { Money } from '../../../core/domain/value-objects/money.vo';
import type { CurrencyCode } from '../../../core/domain/value-objects/money.vo';

export interface CartLineItem {
  variantId: string;
  quantity: number;
  unitPriceAmount: number;
  currency: CurrencyCode;
  discountAmount: number;
  taxRate: number; // yüzde cinsinden, örn. 20 = %20
}

export interface CartTotals {
  subtotal: Money;
  discountTotal: Money;
  shippingAmount: Money;
  taxTotal: Money;
  grandTotal: Money;
  currency: CurrencyCode;
}

export class CartCalculationPipelineService {
  constructor(private readonly db: PrismaClient) {}

  calculateTotals(
    lineItems: CartLineItem[],
    shippingAmount: Money,
    currency: CurrencyCode,
  ): CartTotals {
    const zero = Money.zero(currency);

    const subtotal = lineItems.reduce((sum, item) => {
      const lineTotal = Money.of(item.unitPriceAmount * item.quantity, currency);
      return sum.add(lineTotal);
    }, zero);

    const discountTotal = lineItems.reduce((sum, item) => {
      return sum.add(Money.of(item.discountAmount, currency));
    }, zero);

    const taxableAmount = subtotal.subtract(discountTotal);

    const taxTotal = lineItems.reduce((sum, item) => {
      const itemBase = Math.max(0, item.unitPriceAmount * item.quantity - item.discountAmount);
      const lineBase = Money.of(itemBase, currency);
      return sum.add(lineBase.percentage(item.taxRate));
    }, zero);

    const grandTotal = taxableAmount.add(shippingAmount).add(taxTotal);

    return {
      subtotal,
      discountTotal,
      shippingAmount,
      taxTotal,
      grandTotal,
      currency,
    };
  }

  async getOrCreateCart(token: string, customerId?: string) {
    const existing = await this.db.cart.findUnique({
      where: { token },
      include: { items: { include: { variant: true } } },
    });

    if (existing) return existing;

    return this.db.cart.create({
      data: {
        token,
        customerId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün
      },
      include: { items: { include: { variant: true } } },
    });
  }

  async addToCart(cartToken: string, variantId: string, quantity: number) {
    const cart = await this.db.cart.findUniqueOrThrow({ where: { token: cartToken } });

    const existing = await this.db.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existing) {
      return this.db.cartItem.update({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
        data: { quantity: { increment: quantity } },
      });
    }

    return this.db.cartItem.create({
      data: { cartId: cart.id, variantId, quantity },
    });
  }
}

