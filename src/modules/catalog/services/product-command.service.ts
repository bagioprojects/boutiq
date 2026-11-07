import { generateSlug } from '../../../core/utils/slug';
import { ok, err } from '../../../core/types/result';
import type { Result } from '../../../core/types/result';
import { ConflictError, NotFoundError } from '../../../core/types/errors';
import type { ProductId } from '../../../core/types/branded';
import type { ICacheService } from '../../../core/cache/cache.service';
import type { IProductRepository, CreateProductData, UpdateProductData } from '../models/product.repository';
import type { Product } from '../models/product.entity';
import type { AuditLogService } from '../../../core/security/audit-log.service';

export interface CreateProductDTO {
  title: string;
  bodyHtml?: string;
  status?: 'DRAFT' | 'ACTIVE';
  vendorName?: string;
  productType?: string;
  tags?: string[];
  brandId?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  publishedAt?: Date | null;
}

export class ProductCommandService {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly cache: ICacheService,
    private readonly auditLog: AuditLogService,
  ) {}

  async createProduct(
    dto: CreateProductDTO,
    actorId: string,
  ): Promise<Result<Product>> {
    const slug = generateSlug(dto.title);
    const slugExists = await this.productRepo.existsBySlug(slug);
    if (slugExists) {
      return err(new ConflictError('Product', `A product with slug "${slug}" already exists`));
    }

    const data: CreateProductData = {
      title: dto.title,
      slug,
      bodyHtml: dto.bodyHtml,
      status: dto.status ?? 'DRAFT',
      vendorName: dto.vendorName,
      productType: dto.productType,
      tags: dto.tags ?? [],
      brandId: dto.brandId,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
    };

    const product = await this.productRepo.create(data);

    await this.auditLog.record({
      actorId,
      actorType: 'staff',
      action: 'PRODUCT_CREATED',
      targetType: 'Product',
      targetId: product.id,
    });

    return ok(product);
  }

  async updateProduct(
    id: ProductId,
    dto: UpdateProductDTO,
    actorId: string,
  ): Promise<Result<Product>> {
    const existing = await this.productRepo.findById(id);
    if (!existing) return err(new NotFoundError('Product', id));

    const updates: Partial<UpdateProductData> = { ...dto };

    if (dto.title && dto.title !== existing.title) {
      const newSlug = generateSlug(dto.title);
      const slugExists = await this.productRepo.existsBySlug(newSlug, id);
      if (slugExists) {
        return err(new ConflictError('Product', `Slug "${newSlug}" already exists`));
      }
      updates.slug = newSlug;
    }

    const updated = await this.productRepo.update(id, updates);

    await this.cache.invalidateByTags([`product:${id}`, 'products', 'sitemap:products']);
    await this.auditLog.record({
      actorId,
      actorType: 'staff',
      action: 'PRODUCT_UPDATED',
      targetType: 'Product',
      targetId: id,
      changes: Object.keys(dto).map((field) => ({ field, before: (existing as Record<string, unknown>)[field], after: (dto as Record<string, unknown>)[field] })),
    });

    return ok(updated);
  }

  async archiveProduct(id: ProductId, actorId: string): Promise<Result<void>> {
    const existing = await this.productRepo.findById(id);
    if (!existing) return err(new NotFoundError('Product', id));

    await this.productRepo.update(id, { status: 'ARCHIVED' });
    await this.cache.invalidateByTags([`product:${id}`, 'products']);

    await this.auditLog.record({
      actorId,
      actorType: 'staff',
      action: 'PRODUCT_ARCHIVED',
      targetType: 'Product',
      targetId: id,
    });

    return ok(undefined);
  }

  async deleteProduct(id: ProductId, actorId: string): Promise<Result<void>> {
    const existing = await this.productRepo.findById(id);
    if (!existing) return err(new NotFoundError('Product', id));

    await this.productRepo.softDelete(id);
    await this.cache.invalidateByTags([`product:${id}`, 'products', 'sitemap:products']);

    await this.auditLog.record({
      actorId,
      actorType: 'staff',
      action: 'PRODUCT_DELETED',
      targetType: 'Product',
      targetId: id,
    });

    return ok(undefined);
  }
}
