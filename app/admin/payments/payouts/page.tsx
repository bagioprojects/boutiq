import { AdminPaymentController } from '@/src/controllers/admin/payment.controller';

export const revalidate = 0;

export default async function PayoutsPage() {
  const vm = await AdminPaymentController.getPayoutsViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="view-title">BANKA AKTARIMLARI (PAYOUTS)</h2>
          <p style={{ fontSize: '13px', color: '#718096', marginTop: '3px' }}>
            Banka hesabınıza aktarımı başarıyla tamamlanmış tahsilatlar ({vm.payments.length}).
          </p>
        </div>
      </div>

      <div className="shopier-table-container" style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <table className="shopier-table">
          <thead>
            <tr>
              <th>İşlem ID</th>
              <th>Sipariş No</th>
              <th>Müşteri</th>
              <th>Aktarılan Net Tutar</th>
              <th>Durum</th>
              <th>Aktarım Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {vm.payments.map((p) => (
              <tr key={p.id}>
                <td><code style={{ color: '#4338ca', fontWeight: 600 }}>{p.transaction_id}</code></td>
                <td><strong>{p.order_number}</strong></td>
                <td>{p.customer_name}</td>
                <td><strong style={{ color: '#10b981' }}>{Number(p.net_amount).toFixed(2)} ₺</strong></td>
                <td><span className="badge-status badge-active">Hesaba Aktarıldı</span></td>
                <td><span style={{ fontSize: '12px', color: '#64748b' }}>{p.payout_date || 'Tamamlandı'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
