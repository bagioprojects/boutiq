import { AdminDashboardController } from '@/src/controllers/admin/dashboard.controller';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminSummaryPage() {
  const vm = await AdminDashboardController.getDashboardViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between">
        <div>
          <h2 className="view-title">Hesap Özeti ve Satış Performansı</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            FK Butik mağazanızın anlık satış performansı, sipariş durumları ve genel göstergeleri.
          </p>
        </div>
        <div>
          <a
            href="/"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            <span>Dükkanı Ziyaret Et</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      <div className="kpi-cards-grid" style={{ marginBottom: '28px' }}>
        <div className="kpi-box">
          <div className="kpi-label">Toplam Satış Hacmi</div>
          <div className="kpi-value" style={{ color: '#0f172a' }}>
            {vm.totalRevenueFormatted}
          </div>
          <div className="kpi-sub">Tüm zamanlar cirosu</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-label">Toplam Sipariş</div>
          <div className="kpi-value" style={{ color: '#0284c7' }}>
            {vm.totalOrders}
          </div>
          <div className="kpi-sub">Alınan sipariş adedi</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-label">Aktif Ürün Sayısı</div>
          <div className="kpi-value" style={{ color: '#16a34a' }}>
            {vm.activeProducts}
          </div>
          <div className="kpi-sub">Satışta olan modeller</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-label">Bekleyen İadeler</div>
          <div className="kpi-value" style={{ color: '#d97706' }}>
            {vm.pendingReturns}
          </div>
          <div className="kpi-sub">İnceleme bekleyen</div>
        </div>
      </div>

      <div className="shopier-card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Son Alınan Siparişler
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
              En son tamamlanan müşteri siparişleri ve anlık durumları.
            </p>
          </div>
          <Link
            href="/admin/orders"
            style={{
              fontSize: '13px',
              color: '#ff6000',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Tüm Siparişleri Gör →
          </Link>
        </div>

        <div className="shopier-table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="shopier-table">
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Müşteri</th>
                <th>Şehir</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {vm.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <code style={{ color: '#0f172a', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '3px 6px', borderRadius: '4px' }}>
                      {o.order_number}
                    </code>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{o.customer_name}</strong>
                  </td>
                  <td>{o.customer_city}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>
                      {Number(o.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </strong>
                  </td>
                  <td>
                    <span className="badge-status badge-active">{o.status}</span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>
                    {new Date(o.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
