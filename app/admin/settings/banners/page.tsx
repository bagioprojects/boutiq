import { AdminSettingsController } from '@/src/controllers/admin/settings.controller';

export const revalidate = 0;

export default async function BannersPage() {
  const { banners } = await AdminSettingsController.getBannersViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between">
        <div>
          <h2 className="view-title">Logo ve Banner CMS</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Ana sayfa vitrini ve slider alanlarında dönen kampanya görselleri ({banners.length}).
          </p>
        </div>
        <div>
          <button
            type="button"
            style={{
              padding: '10px 20px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
            }}
          >
            + Yeni Banner Yükle
          </button>
        </div>
      </div>

      <div className="shopier-table-container">
        <table className="shopier-table">
          <thead>
            <tr>
              <th>Görsel Önizleme</th>
              <th>Banner Başlığı</th>
              <th>Hedef Yönlendirme URL</th>
              <th>Sıralama</th>
              <th>Yayın Durumu</th>
              <th style={{ textAlign: 'right' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id}>
                <td style={{ width: '120px' }}>
                  <img
                    src={b.image_url}
                    alt={b.title}
                    style={{ width: '100px', height: '46px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}
                  />
                </td>
                <td>
                  <strong style={{ color: '#0f172a' }}>{b.title}</strong>
                </td>
                <td>
                  <code style={{ color: '#ff6000', backgroundColor: '#fff7ed', padding: '2px 6px', borderRadius: '4px' }}>
                    {b.link_url}
                  </code>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: '#475569' }}>#{b.sort_order}</span>
                </td>
                <td>
                  <span className={`badge-status ${b.is_active ? 'badge-active' : 'badge-inactive'}`}>
                    {b.is_active ? '✓ Yayında' : '✕ Pasif'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      background: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#334155',
                    }}
                  >
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
