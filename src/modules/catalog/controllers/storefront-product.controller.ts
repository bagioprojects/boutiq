import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { ProductQueryService } from '../services/product-query.service';
import type { Product } from '../models/product.entity';
import type { ProductFilters, CursorPage } from '../models/product.repository';
import type { PaginatedList } from '../../../core/types/pagination';

export class StorefrontProductController extends BaseController {
  constructor(private readonly queryService: ProductQueryService) {
    super();
  }

  async getBySlug(slug: string): Promise<ApiResponse<Product>> {
    const result = await this.queryService.getProductBySlug(slug);
    return this.handleResult(result);
  }

  async list(filters: ProductFilters, page: CursorPage): Promise<ApiResponse<PaginatedList<Product>>> {
    const result = await this.queryService.listProducts(
      { ...filters, status: 'ACTIVE' },
      page,
    );
    return this.handleResult(result);
  }
}

