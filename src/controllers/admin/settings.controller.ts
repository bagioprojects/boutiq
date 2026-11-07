import { SettingsRepository } from '@/src/models/repositories/settings.repository';
import { AdminDiscountsViewModel, AdminSettingsViewModel } from '@/src/models/dtos';

export class AdminSettingsController {
  public static async getDiscountsViewModel(): Promise<AdminDiscountsViewModel> {
    const coupons = SettingsRepository.getCoupons();
    return { coupons };
  }

  public static async getShopSettingsViewModel() {
    const shopSettings = SettingsRepository.getShopSettings();
    return { shopSettings };
  }

  public static async getBannersViewModel() {
    const banners = SettingsRepository.getBanners();
    return { banners };
  }

  public static async getCategoriesViewModel() {
    const categories = SettingsRepository.getCategories();
    return { categories };
  }

  public static async getTagsViewModel() {
    const tags = SettingsRepository.getTags();
    return { tags };
  }

  public static async getVariationsViewModel() {
    const variations = SettingsRepository.getVariations();
    return { variations };
  }

  public static async getShippingSettingsViewModel() {
    const shopSettings = SettingsRepository.getShopSettings();
    return {
      flatRate: '49.90 ₺',
      freeShippingMin: shopSettings.free_shipping_limit ? `${shopSettings.free_shipping_limit} ₺` : '1500 ₺',
      carrier: 'Yurtiçi Kargo / MNG',
    };
  }

  public static async getIntegrationsViewModel() {
    const integrations = SettingsRepository.getIntegrations();
    return { integrations };
  }

  public static async getAccountViewModel() {
    return {
      companyName: 'FK Butik Tekstil Ltd. Şti.',
      email: 'yonetim@fkbutik.com',
      phone: '+90 850 259 0 449',
    };
  }
}

