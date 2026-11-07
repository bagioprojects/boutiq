export interface ProductEntity {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  price: string | number;
  price_num: number | null;
  stock: number;
  sizes: string;
  color_count: number | null;
  has_video: number | null;
  has_back_inset: number | null;
  image: string | null;
  url: string | null;
  badge?: string | null;
  is_active: number;
  created_at?: string;
}

export interface ParsedProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  priceFormatted: string;
  stock: number;
  sizes: string[];
  colorCount: number;
  hasVideo: boolean;
  hasBackInset: boolean;
  image: string;
  images: string[];
  url: string;
  badge: string | null;
  isActive: boolean;
  createdAt: string;
}

