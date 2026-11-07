import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { DiscountEngineService, DiscountContext } from '../services/discount-engine.service';

export class DiscountController extends BaseController {
  constructor(private readonly discountService: DiscountEngineService) {
    super();
  }

  async validateCoupon(code: string, context: DiscountContext): Promise<ApiResponse<any>> {
    const result = await this.discountService.applyCode(code, context);
    return this.handleResult(result);
  }

  async getAutomaticDiscounts(context: DiscountContext): Promise<ApiResponse<any>> {
    const discounts = await this.discountService.getAutoDiscounts(context);
    return this.ok(discounts);
  }
}

