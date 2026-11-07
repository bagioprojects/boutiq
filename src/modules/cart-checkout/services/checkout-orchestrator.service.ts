import type { PrismaClient } from '@prisma/client';
import { ok, err } from '../../../core/types/result';
import type { Result } from '../../../core/types/result';
import { ValidationError, NotFoundError } from '../../../core/types/errors';
import type { CartCalculationPipelineService, CartLineItem } from './cart-calculation-pipeline.service';
import { Money } from '../../../core/domain/value-objects/money.vo';
import type { CurrencyCode } from '../../../core/domain/value-objects/money.vo';

export interface CheckoutInput {
  cartToken: string;
  email: string;
  phone?: string;
  shippingAddress: Record<string, unknown>;
  billingAddress: Record<string, unknown>;
  paymentGateway: string;
  cardToken?: string;
  idempotencyKey: string;
}

export class CheckoutOrchestratorService {
  constructor(
    private readonly db: PrismaClient,
    private readonly cartPipeline: CartCalculationPipelineService,
  ) {}

  async createCheckoutSession(input: CheckoutInput): Promise<Result<{ orderId: string; totalAmount: number }>> {
    const cart = await this.db.cart.findUnique({
      where: { token: input.cartToken },
      include: { items: { include: { variant: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return err(new ValidationError('Sepet boş veya bulunamadı'));
    }

    const currency = (cart.currency || 'TRY') as CurrencyCode;
    const lineItems: CartLineItem[] = cart.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      unitPriceAmount: item.variant.priceAmount,
      currency,
      discountAmount: 0,
      taxRate: 20, // Varsayılan KDV %20
    }));

    const shippingAmount = Money.of(0, currency);
    const totals = this.cartPipeline.calculateTotals(lineItems, shippingAmount, currency);

    const order = await this.db.order.create({
      data: {
        email: input.email,
        phone: input.phone,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'PENDING',
        subtotalAmount: totals.subtotal.amount,
        discountAmount: totals.discountTotal.amount,
        shippingAmount: totals.shippingAmount.amount,
        taxAmount: totals.taxTotal.amount,
        totalAmount: totals.grandTotal.amount,
        currency,
        shippingAddress: input.shippingAddress as any,
        billingAddress: input.billingAddress as any,
        lineItems: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            title: item.variant.title,
            quantity: item.quantity,
            unitPriceAmount: item.variant.priceAmount,
            totalAmount: item.variant.priceAmount * item.quantity,
          })),
        },
      },
    });

    return ok({ orderId: order.id, totalAmount: order.totalAmount });
  }
}

