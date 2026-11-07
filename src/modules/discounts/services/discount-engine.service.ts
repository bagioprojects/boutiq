import type { PrismaClient } from '@prisma/client';
import { Money } from '../../../core/domain/value-objects/money.vo';
import type { CurrencyCode } from '../../../core/domain/value-objects/money.vo';
import { ok, err } from '../../../core/types/result';
import type { Result } from '../../../core/types/result';
import { NotFoundError, ValidationError } from '../../../core/types/errors';

export interface DiscountContext {
  customerId?: string;
  lineItems: Array<{
    variantId: string;
    quantity: number;
    unitPriceAmount: number;
    currency: CurrencyCode;
  }>;
  currency: CurrencyCode;
}

export interface DiscountResult {
  discountRuleId: string;
  code?: string;
  discountType: string;
  discountAmount: number;
  allocationMethod: 'ACROSS' | 'EACH' | 'ONE';
}

export class DiscountEngineService {
  constructor(private readonly db: PrismaClient) {}

  async applyCode(code: string, context: DiscountContext): Promise<Result<DiscountResult>> {
    const rule = await this.db.discountRule.findFirst({
      where: {
        code: { equals: code, mode: 'insensitive' },
        isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }],
      },
    });

    if (!rule) {
      return err(new NotFoundError('İndirim Kodu', code));
    }

    if (rule.usageLimit && rule.usageCount >= rule.usageLimit) {
      return err(new ValidationError('Bu kupon kodunun kullanım limiti dolmuştur'));
    }

    const subtotal = context.lineItems.reduce(
      (sum, item) => sum + item.unitPriceAmount * item.quantity,
      0,
    );

    if (rule.minimumAmount && subtotal < rule.minimumAmount) {
      return err(
        new ValidationError(
          `Minimum sipariş tutarı ${(rule.minimumAmount / 100).toFixed(2)} ${context.currency} olmalıdır`,
        ),
      );
    }

    const discountAmount = this.calculateDiscountAmount(rule, context);

    return ok({
      discountRuleId: rule.id,
      code: rule.code ?? undefined,
      discountType: rule.type,
      discountAmount,
      allocationMethod: 'ACROSS',
    });
  }

  async getAutoDiscounts(context: DiscountContext): Promise<DiscountResult[]> {
    const rules = await this.db.discountRule.findMany({
      where: {
        code: null,
        isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }],
      },
    });

    return rules
      .map((rule) => ({
        discountRuleId: rule.id,
        discountType: rule.type,
        discountAmount: this.calculateDiscountAmount(rule, context),
        allocationMethod: 'ACROSS' as const,
      }))
      .filter((r) => r.discountAmount > 0);
  }

  private calculateDiscountAmount(
    rule: { type: string; value: number; valueType: string; buyQuantity?: number | null; getQuantity?: number | null },
    context: DiscountContext,
  ): number {
    const subtotal = context.lineItems.reduce(
      (sum, item) => sum + item.unitPriceAmount * item.quantity,
      0,
    );
    const currency = context.currency;

    switch (rule.type) {
      case 'PERCENTAGE':
        // value baz puan cinsinden (örn: 1000 = %10) veya direkt yüzde (10 = %10)
        const percent = rule.value > 100 ? rule.value / 100 : rule.value;
        return Money.of(subtotal, currency).percentage(percent).amount;
      case 'FIXED_AMOUNT':
        return Math.min(rule.value, subtotal);
      case 'FREE_SHIPPING':
        return 0;
      default:
        return 0;
    }
  }

  async checkCombinability(discountIds: string[]): Promise<boolean> {
    if (discountIds.length <= 1) return true;

    const rules = await this.db.discountRule.findMany({
      where: { id: { in: discountIds } },
      select: {
        type: true,
        combinesWithProductDiscounts: true,
        combinesWithOrderDiscounts: true,
        combinesWithShippingDiscounts: true,
      },
    });

    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const a = rules[i];
        const b = rules[j];
        if (!a || !b) continue;

        if (a.type === 'FIXED_AMOUNT' && b.type === 'FIXED_AMOUNT') {
          if (!a.combinesWithOrderDiscounts || !b.combinesWithOrderDiscounts) return false;
        }
      }
    }

    return true;
  }
}

