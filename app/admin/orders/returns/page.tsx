import { AdminOrderController } from '@/src/controllers/admin/order.controller';
import Link from 'next/link';

export const revalidate = 0;

export default async function ReturnsPage() {
  const vm = await AdminOrderController.getReturnsViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between">
        <div>
          <h2 className="view-title">İptal ve İade Talepleri</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Müşterilerden gelen iade talepleri ve aksiyon süreçleri ({vm.totalCount}).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            href="/admin/orders"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Tüm Siparişler
          </Link>
          <Link
            href="/admin/orders/returns"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            İade Talepleri ({vm.totalCount})
          </Link>
        </div>
      </div>

      <div className="shopier-table-container">
        <table className="shopier-table">
          <thead>
            <tr>
              <th>Talep No</th>
              <th>Sipariş No</th>
              <th>Müşteri</th>
              <th>İade Nedeni</th>
              <th>Tutar</th>
              <th>Durum</th>
              <th style={{ textAlign: 'right' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {vm.returns.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  Kayıtlı aktif iptal veya iade talebi bulunmuyor.
                </td>
              </tr>
            ) : (
              vm.returns.map((r) => (
                <tr key={r.id}>
                  <td>
                    <code style={{ color: '#0f172a', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '3px 6px', borderRadius: '4px' }}>
                      RET-{r.id}
                    </code>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{r.order_number}</strong>
                  </td>
                  <td>{r.customer_name}</td>
                  <td>
                    <span style={{ color: '#475569' }}>{r.reason}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>
                      {Number(r.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </strong>
                  </td>
                  <td>
                    <span className="badge-status badge-pending">
                      <span>⚠️</span> {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      style={{
                        padding: '6px 14px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        background: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                      }}
                    >
                      İncele
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
