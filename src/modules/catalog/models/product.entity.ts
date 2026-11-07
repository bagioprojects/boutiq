import { DomainError } from '../../../core/domain/errors/domain.error';
import type { ProductId } from '../../../core/types/branded';
import type { Money } from '../../../core/domain/value-objects/money.vo';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface ProductVariantSummary {
  id: string;
  sku: string | null;
  priceAmount: number;
  priceCurrency: string;
  compareAtPriceAmount: number | null;
  inventoryQuantity: number;
  option1Value: string | null;
  option2Value: string | null;
  option3Value: string | null;
}

export interface ProductImageSummary {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  blurHash: string | null;
  position: number;
}

export class Product {
  constructor(
    public readonly id: ProductId,
    public readonly title: string,
    public readonly slug: string,
    public readonly status: ProductStatus,
    public readonly variants: ProductVariantSummary[],
    public readonly images: ProductImageSummary[],
    public readonly tags: string[],
    public readonly vendorName: string | null,
    public readonly productType: string | null,
    public readonly brandId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title.trim()) throw new DomainError('Product title cannot be empty');
    if (this.slug.length > 255) throw new DomainError('Product slug too long');
    if (this.variants.length === 0) throw new DomainError('Product must have at least one variant');
  }

  get isAvailable(): boolean {
    return (
      this.status === ProductStatus.ACTIVE &&
      this.variants.some((v) => v.inventoryQuantity > 0)
    );
  }

  get lowestPriceAmount(): number {
    return Math.min(...this.variants.map((v) => v.priceAmount));
  }

  get highestPriceAmount(): number {
    return Math.max(...this.variants.map((v) => v.priceAmount));
  }

  get hasPriceRange(): boolean {
    return this.lowestPriceAmount !== this.highestPriceAmount;
  }

  get primaryImage(): ProductImageSummary | null {
    return this.images.find((i) => i.position === 1) ?? this.images[0] ?? null;
  }

  get optionNames(): string[] {
    const first = this.variants[0];
    if (!first) return [];
    return [first.option1Value, first.option2Value, first.option3Value]
      .map((_, idx) => {
        const key = `option${idx + 1}Name` as keyof ProductVariantSummary;
        return String(first[key] ?? '');
      })
      .filter(Boolean);
  }
}
