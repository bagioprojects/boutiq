import { AdminPaymentController } from '@/src/controllers/admin/payment.controller';

export const revalidate = 0;

export default async function PendingPaymentsPage() {
  const vm = await AdminPaymentController.getPendingPaymentsViewModel();

  return (
    <div>
      <div className="shopier-view-header flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="view-title">BEKLEYEN ÖDEMELER & HESAP AKTARIMLARI</h2>
          <p style={{ fontSize: '13px', color: '#718096', marginTop: '3px' }}>
            Bloke süresi devam eden ve sonraki valör gününde hesaba geçecek işlemler ({vm.payments.length}).
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
              <th>Bekleyen Net Tutar</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {vm.payments.map((p) => (
              <tr key={p.id}>
                <td><code style={{ color: '#4338ca', fontWeight: 600 }}>{p.transaction_id}</code></td>
                <td><strong>{p.order_number}</strong></td>
                <td>{p.customer_name}</td>
                <td><strong style={{ color: '#f59e0b' }}>{Number(p.net_amount).toFixed(2)} ₺</strong></td>
                <td><span className="badge-status badge-pending">Beklemede</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
