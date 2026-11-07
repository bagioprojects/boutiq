import { ParsedProduct } from '../entities/product.entity';
import { OrderEntity, ReturnEntity } from '../entities/order.entity';
import { PaymentEntity, PaymentStatsSummary } from '../entities/payment.entity';
import { BannerEntity, CategoryEntity, CouponEntity, IntegrationEntity, TagEntity, VariationEntity } from '../entities/settings.entity';
import { ProductCardProps } from '@/src/views-components/molecules/ProductCard';

export interface HomePageViewModel {
  heroTitle: string;
  heroSubtitle: string;
  featuredProducts: ProductCardProps[];
  categories: CategoryEntity[];
}

export interface CollectionPageViewModel {
  title: string;
  slug: string;
  products: ProductCardProps[];
  totalCount: number;
  categories?: any[];
}

export interface ProductColorVariant {
  name: string;
  imageUrl: string;
  inStock: boolean;
  slug?: string;
}

export interface ProductDetailPageViewModel {
  product: ParsedProduct;
  images: Array<{ id: string; url: string; altText?: string }>;
  sizes: string[];
  colors?: ProductColorVariant[];
  similarProducts?: ProductCardProps[];
  modelStats?: {
    size: string;
    modelSize: string;
    height: string;
    weight: string;
    chest: string;
    waist: string;
    hips: string;
  };
  features?: Array<{ label: string; value: string }>;
  sizeTable?: Array<{ size: string; width: string; length: string }>;
}

export interface AdminDashboardViewModel {
  totalRevenue: number;
  totalRevenueFormatted: string;
  totalOrders: number;
  activeProducts: number;
  pendingReturns: number;
  recentOrders: OrderEntity[];
}

export interface AdminProductsViewModel {
  products: ParsedProduct[];
  totalCount: number;
}

export interface AdminOrdersViewModel {
  orders: OrderEntity[];
  totalCount: number;
  activeFilter?: string;
}

export interface AdminReturnsViewModel {
  returns: ReturnEntity[];
  totalCount: number;
}

export interface AdminPaymentsViewModel {
  payments: PaymentEntity[];
  stats: PaymentStatsSummary;
}

export interface AdminDiscountsViewModel {
  coupons: CouponEntity[];
}

export interface AdminSettingsViewModel {
  shopSettings: Record<string, string>;
  banners: BannerEntity[];
  categories: CategoryEntity[];
  tags: TagEntity[];
  variations: VariationEntity[];
  integrations: IntegrationEntity[];
}

