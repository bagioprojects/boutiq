import { AdminPaymentController } from '@/src/controllers/admin/payment.controller';
import Link from 'next/link';

export const revalidate = 0;

export default async function PaymentsPage() {
  const vm = await AdminPaymentController.getPaymentsViewModel();
  const { payments, stats } = vm;

  return (
    <div>
      <div className="shopier-view-header flex-between">
        <div>
          <h2 className="view-title">Tahsilatlar ve Banka Aktarımları</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Kredi kartı ve havale tahsilatlarını, komisyon kesintilerini ve banka hesap aktarımlarını takip edin.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/admin/payments"
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
            Tahsilat Dökümü
          </Link>
          <Link
            href="/admin/payments/payouts"
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
            Banka Aktarımları (Payouts)
          </Link>
        </div>
      </div>

      <div className="kpi-cards-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-box">
          <div className="kpi-label">Toplam Brüt Tahsilat</div>
          <div className="kpi-value" style={{ color: '#0f172a' }}>
            {stats.grossTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
          <div className="kpi-sub">Tüm sipariş ödemeleri</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-label">Komisyon &amp; Kesintiler</div>
          <div className="kpi-value" style={{ color: '#dc2626' }}>
            -{stats.commissionTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
          <div className="kpi-sub">Ödeme sağlayıcı oranı</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-label">Net Aktarılan Tutar</div>
          <div className="kpi-value" style={{ color: '#16a34a' }}>
            {stats.netTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
          <div className="kpi-sub">Banka hesabına geçen</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-label">Bekleyen Payout</div>
          <div className="kpi-value" style={{ color: '#d97706' }}>
            {stats.pendingPayoutTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
          <div className="kpi-sub">Sıradaki aktarım günü</div>
        </div>
      </div>

      <div className="shopier-table-container">
        <table className="shopier-table">
          <thead>
            <tr>
              <th>İşlem ID</th>
              <th>Sipariş No</th>
              <th>Müşteri</th>
              <th>Yöntem</th>
              <th>Brüt Tutar</th>
              <th>Komisyon</th>
              <th>Net Tutar</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>
                  <code style={{ color: '#0f172a', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '3px 6px', borderRadius: '4px' }}>
                    {p.transaction_id}
                  </code>
                </td>
                <td>
                  <strong>{p.order_number}</strong>
                </td>
                <td>{p.customer_name}</td>
                <td>
                  <span className="badge-pill">{p.method}</span>
                </td>
                <td>
                  <strong>{Number(p.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
                </td>
                <td style={{ color: '#dc2626', fontWeight: 600 }}>
                  -{Number(p.commission_fee).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </td>
                <td>
                  <strong style={{ color: '#16a34a' }}>
                    {Number(p.net_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </strong>
                </td>
                <td>
                  <span className={`badge-status ${p.status === 'Aktarıldı' ? 'badge-active' : 'badge-pending'}`}>
                    {p.status === 'Aktarıldı' ? '✓ ' : '⏳ '}
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
