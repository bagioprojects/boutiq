import { AdminSettingsController } from '@/src/controllers/admin/settings.controller';
import { AccountSettingsClient } from './AccountSettingsClient';

export const revalidate = 0;

export default async function AccountPage() {
  const vm = await AdminSettingsController.getAccountViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between">
        <div>
          <h2 className="view-title">Hesap ve Güvenlik Yönetimi</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Yönetici profili, şirket fatura bilgileri ve şifre ayarları.
          </p>
        </div>
      </div>

      <AccountSettingsClient
        initialCompanyName={vm.companyName}
        initialEmail={vm.email}
        initialPhone={vm.phone}
      />
    </div>
  );
}
