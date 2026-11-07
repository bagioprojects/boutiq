import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { PaymentOrchestratorService } from '../services/payment-orchestrator.service';
import type { ShippingCalculatorService, ShippingCalculationInput } from '../services/shipping-calculator.service';

export class PaymentWebhookController extends BaseController {
  constructor(
    private readonly paymentOrchestrator: PaymentOrchestratorService,
    private readonly shippingCalculator: ShippingCalculatorService,
  ) {
    super();
  }

  async handleWebhook(body: any, signature: string): Promise<ApiResponse<{ received: boolean }>> {
    // Webhook doğrulama ve işlem mantığı
    return this.ok({ received: true });
  }

  async calculateShipping(input: ShippingCalculationInput): Promise<ApiResponse<any>> {
    const rates = this.shippingCalculator.calculate(input);
    return this.ok(rates);
  }
}

