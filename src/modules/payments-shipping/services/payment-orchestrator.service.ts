import type { PrismaClient } from '@prisma/client';
import { ok, err } from '../../../core/types/result';
import type { Result } from '../../../core/types/result';
import { AppError } from '../../../core/types/errors';
import type { OrderId } from '../../../core/types/branded';

export interface PaymentIntent {
  amount: number;
  currency: string;
  orderId: OrderId;
  customerId?: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  transactionId: string;
  gatewayTxId: string;
  status: 'AUTHORIZED' | 'PAID' | 'FAILED';
  threeDsRequired: boolean;
  redirectUrl?: string;
}

export interface IPaymentGateway {
  name: string;
  charge(intent: PaymentIntent, cardToken?: string): Promise<PaymentResult>;
  refund(gatewayTxId: string, amount: number): Promise<{ refundId: string }>;
  void(gatewayTxId: string): Promise<void>;
}

export class PaymentOrchestratorService {
  private readonly gateways: Map<string, IPaymentGateway> = new Map();
  private readonly PRIMARY_GATEWAY = 'iyzico';

  constructor(private readonly db: PrismaClient) {}

  registerGateway(gateway: IPaymentGateway): void {
    this.gateways.set(gateway.name, gateway);
  }

  async chargeOrder(
    intent: PaymentIntent,
    cardToken?: string,
    preferredGateway?: string,
  ): Promise<Result<PaymentResult>> {
    const gatewayName = preferredGateway ?? this.PRIMARY_GATEWAY;
    const gateway = this.gateways.get(gatewayName);

    if (!gateway) {
      return err(new AppError('GATEWAY_NOT_FOUND', `Ödeme sağlayıcı (${gatewayName}) bulunamadı`));
    }

    try {
      const result = await gateway.charge(intent, cardToken);

      await this.db.paymentTransaction.create({
        data: {
          orderId: intent.orderId,
          gateway: gatewayName,
          amount: intent.amount,
          currency: intent.currency,
          status: result.status,
          kind: 'CHARGE',
          gatewayTxId: result.gatewayTxId,
          threeDsRequired: result.threeDsRequired,
          idempotencyKey: intent.idempotencyKey,
          processedAt: new Date(),
        },
      });

      return ok(result);
    } catch (error) {
      await this.db.paymentTransaction.create({
        data: {
          orderId: intent.orderId,
          gateway: gatewayName,
          amount: intent.amount,
          currency: intent.currency,
          status: 'FAILED',
          kind: 'CHARGE',
          errorMessage: String(error),
          idempotencyKey: intent.idempotencyKey,
        },
      });

      return err(new AppError('PAYMENT_FAILED', String(error), 402));
    }
  }

  async refundTransaction(
    transactionId: string,
    amount: number,
    orderId: OrderId,
  ): Promise<Result<void>> {
    const tx = await this.db.paymentTransaction.findFirst({
      where: { orderId, status: 'PAID' },
    });

    if (!tx?.gatewayTxId) {
      return err(new AppError('TRANSACTION_NOT_FOUND', 'İade edilebilecek ödenmiş işlem bulunamadı'));
    }

    const gateway = this.gateways.get(tx.gateway);
    if (!gateway) {
      return err(new AppError('GATEWAY_NOT_FOUND', `Ödeme sağlayıcı (${tx.gateway}) bulunamadı`));
    }

    const { refundId } = await gateway.refund(tx.gatewayTxId, amount);

    await this.db.paymentTransaction.create({
      data: {
        orderId,
        gateway: tx.gateway,
        amount,
        currency: tx.currency,
        status: 'REFUNDED',
        kind: 'REFUND',
        gatewayTxId: refundId,
        processedAt: new Date(),
        idempotencyKey: `refund_${transactionId}_${Date.now()}`,
      },
    });

    return ok(undefined);
  }
}

