import type { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export type WebhookTopic =
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_PAID'
  | 'ORDER_CANCELLED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'INVENTORY_UPDATED'
  | 'CUSTOMER_CREATED'
  | 'CUSTOMER_UPDATED';

export class WebhookDispatcherService {
  constructor(private readonly db: PrismaClient) {}

  generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  async dispatch(topic: WebhookTopic, payload: Record<string, unknown>): Promise<void> {
    const subscriptions = await this.db.webhookSubscription.findMany({
      where: { topic, isActive: true },
    });

    const payloadString = JSON.stringify(payload);

    for (const sub of subscriptions) {
      const signature = this.generateSignature(payloadString, sub.secretHash);

      // Webhook delivery kaydını oluştur
      const delivery = await this.db.webhookDelivery.create({
        data: {
          subscriptionId: sub.id,
          topic,
          payload: payload as any,
          status: 'PENDING',
          attemptCount: 1,
        },
      });

      // Asenkron HTTP çağrısı
      try {
        const response = await fetch(sub.callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Topic': topic,
            'X-Webhook-Signature': signature,
          },
          body: payloadString,
          signal: AbortSignal.timeout(5000), // 5 saniye zaman aşımı
        });

        await this.db.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: response.ok ? 'SUCCESS' : 'FAILURE',
            responseCode: response.status,
            deliveredAt: new Date(),
          },
        });
      } catch (err: any) {
        await this.db.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'FAILURE',
            responseBody: String(err?.message || err),
            nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // 5 dk sonra retry
          },
        });
      }
    }
  }
}

