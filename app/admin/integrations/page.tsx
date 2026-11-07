import { AdminSettingsController } from '@/src/controllers/admin/settings.controller';

export const revalidate = 0;

export default async function IntegrationsPage() {
  const { integrations } = await AdminSettingsController.getIntegrationsViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between">
        <div>
          <h2 className="view-title">Entegrasyon Merkezi</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Ödeme sistemleri, kargo firmaları ve e-fatura bağlantıları ({integrations.length}).
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {integrations.map((i) => (
          <div
            key={i.key}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>{i.name}</strong>
                <span className={`badge-status ${i.is_enabled ? 'badge-active' : 'badge-inactive'}`}>
                  {i.is_enabled ? '✓ Bağlı' : '✕ Bağlı Değil'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
                {i.description || 'Aktif API bağlantısı ve senkronizasyon servisi'}
              </p>
            </div>
            <button
              type="button"
              style={{
                width: '100%',
                padding: '9px 16px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Yapılandır &amp; Test Et
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
