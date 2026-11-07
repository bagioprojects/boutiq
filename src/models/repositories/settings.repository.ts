import { db } from '@/lib/db';
import {
  BannerEntity,
  CategoryEntity,
  CouponEntity,
  IntegrationEntity,
  SettingRow,
  TagEntity,
  VariationEntity,
} from '../entities/settings.entity';

export class SettingsRepository {
  public static getShopSettings(): Record<string, string> {
    const rows = (db.prepare('SELECT * FROM shop_settings').all() as any[]).map((r) => ({ ...r }));
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  }

  public static getBanners(): BannerEntity[] {
    return (db.prepare('SELECT * FROM banners ORDER BY sort_order ASC').all() as any[]).map((r) => ({ ...r }));
  }

  public static getCategories(): CategoryEntity[] {
    return (db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all() as any[]).map((r) => ({ ...r }));
  }

  public static getTags(): TagEntity[] {
    return (db.prepare('SELECT * FROM tags ORDER BY sort_order ASC').all() as any[]).map((r) => ({ ...r }));
  }

  public static getCoupons(): CouponEntity[] {
    return (db.prepare('SELECT * FROM coupons ORDER BY id DESC').all() as any[]).map((r) => ({ ...r }));
  }

  public static getVariations(): VariationEntity[] {
    return (db.prepare('SELECT * FROM variations ORDER BY id ASC').all() as any[]).map((r) => ({ ...r }));
  }

  public static getIntegrations(): IntegrationEntity[] {
    return (db.prepare('SELECT * FROM integrations').all() as any[]).map((r) => ({ ...r }));
  }
}

