'use client';

import React, { useState } from 'react';

export interface OrderItemData {
  product_id?: number;
  product_name: string;
  sku?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface AdminOrderRow {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  total_amount: number;
  status: string;
  payment_method: string;
  cargo_company?: string;
  tracking_code?: string;
  items_json?: string;
  created_at: string;
}

interface OrderActionManagerProps {
  orders: AdminOrderRow[];
  title?: string;
  subtitle?: string;
  activeFilter?: 'all' | 'pending' | 'shipped' | 'returns';
}

export const OrderActionManager: React.FC<OrderActionManagerProps> = ({
  orders: initialOrders,
  title = 'SİPARİŞLER',
  subtitle = 'Müşteri siparişleri ve kargo gönderim yönetimi',
  activeFilter = 'all',
}) => {
  const [orders, setOrders] = useState<AdminOrderRow[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const [shippingModalOrder, setShippingModalOrder] = useState<AdminOrderRow | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const updateOrderStatus = async (orderId: number, newStatus: string, trackingCode?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
          tracking_code: trackingCode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Durum güncellenemedi.');

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, tracking_code: trackingCode || o.tracking_code }
            : o
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus, tracking_code: trackingCode || prev.tracking_code } : null));
      }

      showToast(`Sipariş durumu "${newStatus}" olarak güncellendi.`, 'success');
      setShippingModalOrder(null);
    } catch (err: any) {
      showToast(err.message || 'Güncelleme hatası.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenShippingModal = (order: AdminOrderRow) => {
    setShippingModalOrder(order);
    const prefix = order.cargo_company?.includes('MNG') ? 'MNG' : 'YK';
    setTrackingInput(order.tracking_code || `${prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  const handleConfirmShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingModalOrder) return;
    updateOrderStatus(shippingModalOrder.id, 'Kargoya Verildi', trackingInput.trim());
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.customer_city.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Toast Bildirimi */}
      {feedbackMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 99999,
            backgroundColor: feedbackMsg.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Üst Bar: Başlık & Filtre Tabları */}
      <div className="shopier-view-header flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="view-title">{title}</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            {subtitle} ({filteredOrders.length} sipariş).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a
            href="/admin/orders"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: activeFilter === 'all' ? '#0f172a' : '#ffffff',
              color: activeFilter === 'all' ? '#ffffff' : '#334155',
              border: activeFilter === 'all' ? 'none' : '1px solid #cbd5e1',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Tüm Siparişler
          </a>
          <a
            href="/admin/orders/pending"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: activeFilter === 'pending' ? '#0f172a' : '#ffffff',
              color: activeFilter === 'pending' ? '#ffffff' : '#334155',
              border: activeFilter === 'pending' ? 'none' : '1px solid #cbd5e1',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Hazırlananlar
          </a>
          <a
            href="/admin/orders/shipped"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: activeFilter === 'shipped' ? '#0f172a' : '#ffffff',
              color: activeFilter === 'shipped' ? '#ffffff' : '#334155',
              border: activeFilter === 'shipped' ? 'none' : '1px solid #cbd5e1',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Kargoya Verilenler
          </a>
          <a
            href="/admin/orders/returns"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: activeFilter === 'returns' ? '#0f172a' : '#ffffff',
              color: activeFilter === 'returns' ? '#ffffff' : '#334155',
              border: activeFilter === 'returns' ? 'none' : '1px solid #cbd5e1',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            İptal & İadeler
          </a>
        </div>
      </div>

      {/* Arama Barı */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Sipariş no, müşteri adı, telefon veya şehir ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13.5px',
            outline: 'none',
            background: '#ffffff',
          }}
        />
      </div>

      {/* Sipariş Tablosu Kartı */}
      <div className="shopier-table-container">
        <table className="shopier-table">
          <thead>
            <tr>
              <th>Sipariş No</th>
              <th>Müşteri</th>
              <th>Telefon</th>
              <th>Şehir</th>
              <th>Tutar</th>
              <th>Ödeme</th>
              <th>Durum</th>
              <th style={{ textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Kriterlere uygun sipariş bulunamadı.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const isPending = o.status === 'Hazırlanıyor';
                const isShipped = o.status === 'Kargoya Verildi';
                const isCancelled = o.status === 'İptal Edildi';

                return (
                  <tr key={o.id}>
                    <td>
                      <code
                        style={{
                          color: '#0f172a',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                        }}
                      >
                        {o.order_number}
                      </code>
                      <div style={{ marginTop: '3px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: o.cargo_company?.includes('MNG') ? '#eff6ff' : '#fff7ed',
                            color: o.cargo_company?.includes('MNG') ? '#2563eb' : '#ea580c',
                          }}
                        >
                          🚚 {o.cargo_company || 'Yurtiçi Kargo'}
                        </span>
                      </div>
                      {o.tracking_code && (
                        <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>
                          Takip: {o.tracking_code}
                        </div>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{o.customer_name}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#64748b' }}>{o.customer_phone}</span>
                    </td>
                    <td>{o.customer_city}</td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>
                        {Number(o.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </strong>
                    </td>
                    <td>
                      <span className="badge-pill">{o.payment_method}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: isPending ? '#fef3c7' : isShipped ? '#dbeafe' : isCancelled ? '#ffe4e6' : '#dcfce7',
                          color: isPending ? '#92400e' : isShipped ? '#1e40af' : isCancelled ? '#9f1239' : '#166534',
                        }}
                      >
                        <span>{isPending ? '⏳' : isShipped ? '🚚' : isCancelled ? '✕' : '✓'}</span>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleOpenShippingModal(o)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 700,
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                            }}
                          >
                            Kargola
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
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
                          Detay
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Kargoya Verme Modalı */}
      {shippingModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Kargoya Ver: {shippingModalOrder.order_number}
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Alıcı: {shippingModalOrder.customer_name} ({shippingModalOrder.customer_city})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShippingModalOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmShipping} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Kargo Takip Numarası *
                </label>
                <input
                  type="text"
                  required
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Örn: YK-84910294"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isUpdating ? 'Kaydediliyor...' : 'Kargolandı Olarak İşaretle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sipariş Detay Modalı */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Sipariş Detayı: {selectedOrder.order_number}
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Tarih: {new Date(selectedOrder.created_at).toLocaleString('tr-TR')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Müşteri Bilgileri */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>
                  Müşteri & Teslimat Bilgileri
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13.5px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Ad Soyad:</span> <strong>{selectedOrder.customer_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Telefon:</span> <strong>{selectedOrder.customer_phone}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Şehir:</span> <strong>{selectedOrder.customer_city}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Ödeme:</span> <strong>{selectedOrder.payment_method}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Kargo:</span> <strong style={{ color: (selectedOrder as any).cargo_company?.includes('MNG') ? '#2563eb' : '#ff6000' }}>{(selectedOrder as any).cargo_company || 'Yurtiçi Kargo'}</strong>
                  </div>
                </div>
              </div>

              {/* Sipariş Durumu Değiştirme */}
              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Sipariş Durumunu Güncelle:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Hazırlanıyor', 'Kargoya Verildi', 'Tamamlandı', 'İptal Edildi'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdating || selectedOrder.status === st}
                      onClick={() => updateOrderStatus(selectedOrder.id, st)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: selectedOrder.status === st ? '2px solid #ff6000' : '1px solid #cbd5e1',
                        backgroundColor: selectedOrder.status === st ? '#fff7ed' : '#ffffff',
                        color: selectedOrder.status === st ? '#c2410c' : '#334155',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: selectedOrder.status === st ? 'default' : 'pointer',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sipariş Edilen Ürünler */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>
                  Sipariş Edilen Ürünler
                </h4>
                {selectedOrder.items_json ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      try {
                        const items: OrderItemData[] = JSON.parse(selectedOrder.items_json);
                        return items.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 14px',
                              backgroundColor: '#f8fafc',
                              borderRadius: '8px',
                              fontSize: '13.5px',
                            }}
                          >
                            <div>
                              <strong>{it.product_name}</strong>
                              <span style={{ color: '#64748b', marginLeft: '8px', fontSize: '12px' }}>
                                Beden: {it.size || '-'} | Adet: {it.quantity}
                              </span>
                            </div>
                            <strong style={{ color: '#0f172a' }}>
                              {(it.price * it.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </strong>
                          </div>
                        ));
                      } catch {
                        return <div style={{ color: '#64748b', fontSize: '13px' }}>Ürün listesi okunamadı.</div>;
                      }
                    })()}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '13px' }}>Ürün bilgisi bulunmuyor.</div>
                )}
              </div>

              {/* Genel Toplam */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#334155' }}>Toplam Tutar:</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#ff6000' }}>
                  {Number(selectedOrder.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

