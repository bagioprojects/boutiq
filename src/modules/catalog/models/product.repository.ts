import type { Product } from './product.entity';
import type { ProductId } from '../../../core/types/branded';
import type { PaginatedList } from '../../../core/types/pagination';

export interface ProductFilters {
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  collectionId?: string;
  brandId?: string;
  tags?: string[];
  query?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CursorPage {
  limit: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

export interface IProductRepository {
  findById(id: ProductId): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findMany(filters: ProductFilters, page: CursorPage): Promise<PaginatedList<Product>>;
  create(data: CreateProductData): Promise<Product>;
  update(id: ProductId, data: Partial<UpdateProductData>): Promise<Product>;
  softDelete(id: ProductId): Promise<void>;
  countByFilters(filters: ProductFilters): Promise<number>;
  existsBySlug(slug: string, excludeId?: ProductId): Promise<boolean>;
}

export interface CreateProductData {
  title: string;
  slug: string;
  bodyHtml?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  vendorName?: string;
  productType?: string;
  tags?: string[];
  brandId?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateProductData {
  title: string;
  slug: string;
  bodyHtml?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  vendorName?: string;
  productType?: string;
  tags?: string[];
  brandId?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: Date | null;
}
