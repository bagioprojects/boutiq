'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/src/core/cart/use-cart';

export interface SlideCartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export const SlideCart: React.FC<SlideCartProps> = ({ isOpen, onClose, onCheckout }) => {
  const { items, cartCount, subtotal, shipping, total, updateQuantity, removeItem } = useCart();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık ve Kapat Butonu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              SEPETİM ({cartCount})
            </h3>
            <span style={{ fontSize: '12px', color: shipping === 0 ? '#16a34a' : '#ff6000', fontWeight: 600 }}>
              {subtotal >= 500 ? '500 TL Üzeri Kargonuz Bedava!' : `${(500 - subtotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL daha ekleyin, kargo bedava olsun!`}
            </span>
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
            aria-label="Sepeti Kapat"
          >
            ✕
          </button>
        </div>

        {/* Ürün Listesi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>Sepetiniz henüz boş</div>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Boutique koleksiyonumuzdaki ürünleri inceleyip sepete ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '75px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '11px',
                    color: '#64748b',
                    flexShrink: 0,
                  }}
                >
                  FK
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#ff6000', fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.category}
                  </div>
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      margin: '2px 0 4px',
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    Beden: <strong>{item.size}</strong>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    {(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Kaldır
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ width: '24px', height: '24px', border: 'none', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span style={{ width: '28px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ width: '24px', height: '24px', border: 'none', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sepet Alt Özeti ve Sipariş Butonları */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', color: '#64748b' }}>
              <span>Ara Toplam</span>
              <strong style={{ color: '#0f172a' }}>{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#64748b' }}>
              <span>Kargo</span>
              <strong style={{ color: shipping === 0 ? '#16a34a' : '#0f172a' }}>
                {shipping === 0 ? 'ÜCRETSİZ' : `${shipping.toFixed(2)} ₺`}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '17px', fontWeight: 800 }}>
              <span>Toplam</span>
              <span style={{ color: '#ff6000' }}>{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                href="/sepet"
                onClick={onClose}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #0f172a',
                  padding: '12px 0',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                Sepete Git
              </Link>
              <Link
                href="/sepet?checkout=true"
                onClick={onClose}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ff6000',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(255, 96, 0, 0.3)',
                }}
              >
                Siparişi Tamamla
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
