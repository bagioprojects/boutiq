import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { CartCalculationPipelineService } from '../services/cart-calculation-pipeline.service';

export class CartController extends BaseController {
  constructor(private readonly cartService: CartCalculationPipelineService) {
    super();
  }

  async getCart(token: string, customerId?: string): Promise<ApiResponse<any>> {
    const cart = await this.cartService.getOrCreateCart(token, customerId);
    return this.ok(cart);
  }

  async addItem(token: string, variantId: string, quantity: number): Promise<ApiResponse<any>> {
    const item = await this.cartService.addToCart(token, variantId, quantity);
    return this.created(item);
  }
}

