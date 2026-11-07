'use client';

import React, { useState } from 'react';
import { CartItem, CartStore } from '@/src/core/cart/cart-store';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onSuccess?: (orderNumber: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  shipping,
  total,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerDistrict, setCustomerDistrict] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Kredi Kartı');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerCity.trim()) {
      setErrorMsg('Lütfen ad, telefon ve şehir alanlarını doldurunuz.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_city: customerCity.trim(),
          customer_district: customerDistrict.trim(),
          customer_address: customerAddress.trim(),
          payment_method: paymentMethod,
          total_amount: total,
          items: items.map((i) => ({
            product_id: i.productId,
            product_name: i.name,
            sku: i.slug,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color || '',
            image_url: i.imageUrl || '',
          })),
        }),
      });

      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Sipariş oluşturulurken bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.');
      }
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Sipariş oluşturulamadı.');
      }

      const generatedNumber = data.order_number || data.orderNumber || 'FK-2026-OK';
      setCompletedOrderNumber(generatedNumber);
      CartStore.clearCart();
      if (onSuccess) onSuccess(generatedNumber);
    } catch (err: any) {
      setErrorMsg(err.message || 'Sipariş verilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {completedOrderNumber ? 'Siparişiniz Onaylandı!' : 'Güvenli Ödeme & Sipariş Tamamlama'}
            </h2>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
              {completedOrderNumber
                ? 'FK Butik siparişiniz sisteme kaydedildi.'
                : 'Bilgilerinizi girerek siparişinizi saniyeler içinde tamamlayın.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {completedOrderNumber ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                }}
              >
                ✓
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Teşekkürler, Siparişiniz Alındı!
              </h3>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '16px',
                  margin: '16px 0 20px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Sipariş Referans Numarası</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#ff6000', letterSpacing: '0.04em', marginTop: '4px' }}>
                  {completedOrderNumber}
                </div>
              </div>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, marginBottom: '24px' }}>
                Siparişiniz paketleme ve hazırlık sırasına alınmıştır. Admin panelimiz ve kargo entegrasyonumuz ile anlık senkronizedir.
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.href = '/';
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                Alışverişe Devam Et
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {errorMsg && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Sipariş Toplam Barı */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Toplam ({items.length} Ürün)</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#ff6000' }}>
                    {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: shipping === 0 ? '#16a34a' : '#475569' }}>
                  {shipping === 0 ? 'Ücretsiz Kargo' : `+${shipping.toFixed(2)} ₺ Kargo`}
                </span>
              </div>

              {/* Form Alanları */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ayşe Yılmaz"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Telefon Numarası *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Şehir (İl) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: İstanbul"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Teslimat Adresi
                </label>
                <textarea
                  rows={2}
                  placeholder="Mahalle, Cadde/Sokak, Bina No, Daire..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Ödeme Yöntemi Seçimi */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Ödeme Yöntemi
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['Kredi Kartı', 'Kapıda Ödeme', 'Havale / EFT'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: paymentMethod === method ? '2px solid #ff6000' : '1px solid #cbd5e1',
                        backgroundColor: paymentMethod === method ? '#fff7ed' : '#ffffff',
                        color: paymentMethod === method ? '#c2410c' : '#334155',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Siparişi Onayla Butonu */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '14px',
                  backgroundColor: '#ff6000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '16px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 18px rgba(255, 96, 0, 0.35)',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Sipariş Kaydediliyor...' : `${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ • SİPARİŞİ ONAYLA`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

