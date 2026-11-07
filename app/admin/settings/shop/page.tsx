import { AdminSettingsController } from '@/src/controllers/admin/settings.controller';
import { ShopSettingsClient } from './ShopSettingsClient';

export const revalidate = 0;

export default async function ShopSettingsPage() {
  const { shopSettings } = await AdminSettingsController.getShopSettingsViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between">
        <div>
          <h2 className="view-title">Mağaza Seçenekleri</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Dükkanınızın vitrin davranışlarını, erişim izinlerini ve alışveriş deneyimini yapılandırın.
          </p>
        </div>
      </div>

      <ShopSettingsClient initialSettings={shopSettings} />
    </div>
  );
}
