import { AdminSettingsController } from '@/src/controllers/admin/settings.controller';
import { ShippingSettingsClient } from './ShippingSettingsClient';

export const revalidate = 0;

export default async function ShippingSettingsPage() {
  const vm = await AdminSettingsController.getShippingSettingsViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between">
        <div>
          <h2 className="view-title">Kargo ve Teslimat Ayarları</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Kargo ücreti, ücretsiz kargo baremi ve anlaşmalı lojistik entegrasyonları.
          </p>
        </div>
      </div>

      <ShippingSettingsClient
        initialFlatRate={vm.flatRate}
        initialFreeShippingMin={vm.freeShippingMin}
        initialCarrier={vm.carrier}
      />
    </div>
  );
}
