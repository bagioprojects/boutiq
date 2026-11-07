import { AdminSettingsController } from '@/src/controllers/admin/settings.controller';

export const revalidate = 0;

export default async function TagsPage() {
  const { tags } = await AdminSettingsController.getTagsViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between">
        <div>
          <h2 className="view-title">Koleksiyon Sayfaları ve Etiketler</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Öne çıkan etiketler ve özel koleksiyon sayfaları ({tags.length}).
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
            + Yeni Etiket Ekle
          </button>
        </div>
      </div>

      <div className="shopier-table-container">
        <table className="shopier-table">
          <thead>
            <tr>
              <th>Etiket Adı</th>
              <th>Hedef Koleksiyon URL</th>
              <th>Sıralama</th>
              <th>Durum</th>
              <th style={{ textAlign: 'right' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((t) => (
              <tr key={t.id}>
                <td>
                  <strong style={{ color: '#0f172a' }}>{t.name}</strong>
                </td>
                <td>
                  <code style={{ color: '#ff6000', backgroundColor: '#fff7ed', padding: '2px 6px', borderRadius: '4px' }}>
                    /koleksiyon/{t.slug}
                  </code>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: '#475569' }}>#{t.sort_order}</span>
                </td>
                <td>
                  <span className={`badge-status ${t.is_active ? 'badge-active' : 'badge-inactive'}`}>
                    {t.is_active ? '✓ Aktif' : '✕ Pasif'}
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
