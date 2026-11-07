import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { CheckoutOrchestratorService, CheckoutInput } from '../services/checkout-orchestrator.service';

export class CheckoutController extends BaseController {
  constructor(private readonly checkoutService: CheckoutOrchestratorService) {
    super();
  }

  async processCheckout(input: CheckoutInput): Promise<ApiResponse<{ orderId: string; totalAmount: number }>> {
    const result = await this.checkoutService.createCheckoutSession(input);
    return this.handleResult(result);
  }
}

