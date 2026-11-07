import { ok, err } from '../../../core/types/result';
import type { Result } from '../../../core/types/result';
import { NotFoundError } from '../../../core/types/errors';
import type { ProductId } from '../../../core/types/branded';
import type { ICacheService } from '../../../core/cache/cache.service';
import type { IProductRepository, ProductFilters, CursorPage } from '../models/product.repository';
import type { Product } from '../models/product.entity';
import type { PaginatedList } from '../../../core/types/pagination';

export class ProductQueryService {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly cache: ICacheService,
  ) {}

  async getProductById(id: ProductId): Promise<Result<Product>> {
    const cacheKey = `product:${id}:detail`;
    const cached = await this.cache.get<Product>(cacheKey);
    if (cached) return ok(cached);

    const product = await this.productRepo.findById(id);
    if (!product) return err(new NotFoundError('Product', id));

    await this.cache.set(cacheKey, product, {
      ttl: 3600,
      tags: [`product:${id}`, 'products'],
    });

    return ok(product);
  }

  async getProductBySlug(slug: string): Promise<Result<Product>> {
    const cacheKey = `product:slug:${slug}`;
    const cached = await this.cache.get<Product>(cacheKey);
    if (cached) return ok(cached);

    const product = await this.productRepo.findBySlug(slug);
    if (!product) return err(new NotFoundError('Product', slug));

    await this.cache.set(cacheKey, product, {
      ttl: 3600,
      tags: [`product:${product.id}`, 'products'],
    });

    return ok(product);
  }

  async listProducts(
    filters: ProductFilters,
    page: CursorPage,
  ): Promise<Result<PaginatedList<Product>>> {
    const result = await this.productRepo.findMany(filters, page);
    return ok(result);
  }
}
