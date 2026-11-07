import { AdminSettingsController } from '@/src/controllers/admin/settings.controller';

export const revalidate = 0;

export default async function DiscountsPage() {
  const vm = await AdminSettingsController.getDiscountsViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between">
        <div>
          <h2 className="view-title">Kupon ve İndirim Yönetimi</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Müşterileriniz için indirim kuponları ve promosyon kodları tanımlayın ({vm.coupons.length}).
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
            + Yeni Kupon Oluştur
          </button>
        </div>
      </div>

      <div className="shopier-table-container">
        <table className="shopier-table">
          <thead>
            <tr>
              <th>Kupon Kodu</th>
              <th>İndirim Değeri</th>
              <th>Min. Sepet Tutarı</th>
              <th>Kullanım Adedi</th>
              <th>Durum</th>
              <th style={{ textAlign: 'right' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {vm.coupons.map((c) => (
              <tr key={c.id}>
                <td>
                  <code style={{ fontSize: '13.5px', fontWeight: 800, color: '#ff6000', backgroundColor: '#fff7ed', padding: '3px 8px', borderRadius: '4px', border: '1px solid #ffedd5' }}>
                    {c.code}
                  </code>
                </td>
                <td>
                  <strong>
                    {c.discount_type === 'percentage' ? `%${c.discount_value} İndirim` : `${c.discount_value} ₺ İndirim`}
                  </strong>
                </td>
                <td>{c.min_order_amount ? `${c.min_order_amount} ₺` : 'Yok (Limitsiz)'}</td>
                <td>
                  <span style={{ fontWeight: 600 }}>
                    {c.used_count || 0} / {c.usage_limit ? `${c.usage_limit} limit` : 'Sınırsız'}
                  </span>
                </td>
                <td>
                  <span className={`badge-status ${c.is_active ? 'badge-active' : 'badge-inactive'}`}>
                    {c.is_active ? '✓ Aktif' : '✕ Pasif'}
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
