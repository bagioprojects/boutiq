export interface CategoryEntity {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  is_active: number;
}

export interface BannerEntity {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_active: number;
}

export interface TagEntity {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  is_active: number;
}

export interface CouponEntity {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: number;
}

export interface VariationEntity {
  id: number;
  group_name: string;
  value: string;
  color_hex?: string | null;
  sort_order: number;
  is_active?: number;
  created_at?: string;
}

export interface IntegrationEntity {
  key: string;
  name: string;
  category: string;
  description: string;
  config_json: string;
  is_enabled: number;
  updated_at: string;
}

export interface SettingRow {
  key: string;
  value: string;
  updated_at?: string;
}

