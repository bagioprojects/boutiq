'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../organisms/Header';
import { Footer } from '../organisms/Footer';
import { useCart } from '@/src/core/cart/use-cart';

export const CartTemplate: React.FC = () => {
  const router = useRouter();
  const {
    items,
    cartCount,
    subtotal,
    shipping,
    total,
    freeShippingLimit,
    isFreeShipping,
    updateQuantity,
    removeItem,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const discount = couponApplied ? subtotal * 0.1 : 0;
  const finalTotal = Math.max(0, subtotal - discount + shipping);

  const remainingForFreeShipping = Math.max(0, freeShippingLimit - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingLimit) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (couponCode.trim().toUpperCase() === 'FK10' || couponCode.trim().toUpperCase() === 'HOSGELDIN') {
      setCouponApplied(true);
    } else {
      setCouponError('Geçersiz kupon kodu. (Örn: FK10)');
    }
  };

  const handleProceedToCheckout = () => {
    router.push('/siparis/tamamla');
  };

  const quickCategories = [
    { label: '✨ Yeni Gelenler', url: '/koleksiyon/yeni-gelenler' },
    { label: '👗 Elbiseler', url: '/koleksiyon/elbise' },
    { label: '🧶 Üst Giyim', url: '/koleksiyon/ust-giyim' },
    { label: '👖 Alt Giyim', url: '/koleksiyon/alt-giyim' },
    { label: '🔥 Çok Satanlar', url: '/koleksiyon/cok-satanlar' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />

      <main className="fk-cart-container" style={{ maxWidth: '1200px', margin: '24px auto 80px', padding: '0 16px', width: '100%', flex: 1, boxSizing: 'border-box' }}>
        {items.length === 0 ? (
          /* ========================================================
             1. SEPET BOŞ DURUMU (Masaüstü ve Mobil için Özel Tasarım)
             ======================================================== */
          <div style={{ maxWidth: '640px', margin: '40px auto 60px', width: '100%', textAlign: 'center' }}>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '48px 24px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Lüks Çanta Rozeti */}
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                  color: '#ff6000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 4px 14px rgba(255, 96, 0, 0.15)',
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>

              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                Sepetinizde Henüz Ürün Bulunmuyor
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 26px 0', maxWidth: '420px', lineHeight: 1.5 }}>
                FK Butik özel kadın giyim koleksiyonundaki en şık parçaları keşfetmeye hemen başlayın.
              </p>

              <Link
                href="/koleksiyon/tum-urunler"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#ff6000',
                  color: '#ffffff',
                  padding: '14px 34px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '15px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(255, 96, 0, 0.35)',
                  transition: 'all 0.15s ease',
                  width: '100%',
                  maxWidth: '300px',
                  boxSizing: 'border-box',
                }}
              >
                <span>Koleksiyonları Keşfet</span>
                <span>→</span>
              </Link>

              {/* Hızlı Kategori Rozetleri */}
              <div style={{ marginTop: '36px', width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                  Popüler Koleksiyonlar
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {quickCategories.map((c) => (
                    <Link
                      key={c.url}
                      href={c.url}
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#334155',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '20px',
                        padding: '6px 14px',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff7ed';
                        e.currentTarget.style.borderColor = '#ffedd5';
                        e.currentTarget.style.color = '#ff6000';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#334155';
                      }}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             2. SEPET DOLU DURUMU (Masaüstü ve Mobil Özel Tasarım)
             ======================================================== */
          <div>
            {/* Üst Başlık & Alışverişe Devam Et */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  Alışveriş Sepeti
                </h1>
                <span
                  style={{
                    backgroundColor: '#ffedd5',
                    color: '#ea580c',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '2px 9px',
                    borderRadius: '12px',
                  }}
                >
                  {cartCount} Ürün
                </span>
              </div>

              <Link
                href="/koleksiyon/tum-urunler"
                className="fk-desktop-only"
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#ff6000',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>← Alışverişe Devam Et</span>
              </Link>
            </div>

            {/* PREMİUM DİNAMİK ÜCRETSİZ KARGO HARCAMA BARI */}
            <div
              style={{
                background: isFreeShipping
                  ? 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #fffbf7 100%)',
                border: isFreeShipping ? '1.5px solid #86efac' : '1.5px solid #fed7aa',
                borderRadius: '14px',
                padding: '14px 18px',
                boxShadow: isFreeShipping
                  ? '0 3px 14px -2px rgba(22, 163, 74, 0.08)'
                  : '0 3px 14px -2px rgba(255, 96, 0, 0.06)',
                marginBottom: '22px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isFreeShipping
                        ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                        : 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
                      color: isFreeShipping ? '#15803d' : '#ea580c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isFreeShipping ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" rx="2" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                      {isFreeShipping ? (
                        <span style={{ color: '#15803d' }}>
                          Tebrikler! Kargonuz Ücretsiz
                        </span>
                      ) : (
                        <span>
                          Ücretsiz kargo için <strong style={{ color: '#ea580c' }}>{remainingForFreeShipping.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong> daha ekleyin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 9px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: isFreeShipping ? '#dcfce7' : '#f1f5f9',
                      color: isFreeShipping ? '#15803d' : '#475569',
                      border: `1px solid ${isFreeShipping ? '#86efac' : '#e2e8f0'}`,
                    }}
                  >
                    <span>Hedef:</span>
                    <strong style={{ color: isFreeShipping ? '#15803d' : '#0f172a' }}>
                      {freeShippingLimit.toLocaleString('tr-TR')} ₺
                    </strong>
                  </span>

                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: isFreeShipping ? '#15803d' : '#ea580c' }}>
                    %{Math.round(freeShippingProgress)}
                  </span>
                </div>
              </div>

              {/* İlerleme Barı */}
              <div
                style={{
                  width: '100%',
                  height: '7px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  padding: '1px',
                  boxSizing: 'border-box',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: `${freeShippingProgress}%`,
                    height: '100%',
                    background: isFreeShipping
                      ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                      : 'linear-gradient(90deg, #ff8a00 0%, #ff6000 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease-out',
                  }}
                />
              </div>
            </div>

            {/* ANA DÜZEN: MASAÜSTÜNDE 2 KOLON, MOBİLDE TEK KOLON */}
            <div className="fk-cart-layout">
              {/* SOL KOLON: ÜRÜN KARTLARI */}
              <div className="fk-cart-items-col" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="fk-cart-item-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      boxSizing: 'border-box',
                      position: 'relative',
                    }}
                  >
                    {/* Ürün Görseli */}
                    <Link href={`/urun/${item.id}`} style={{ display: 'block', flexShrink: 0 }}>
                      <img
                        src={item.imageUrl || '/images/default.jpg'}
                        alt={item.name}
                        style={{
                          width: '74px',
                          height: '96px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          backgroundColor: '#f1f5f9',
                          display: 'block',
                          border: '1px solid #f1f5f9',
                        }}
                      />
                    </Link>

                    {/* Ürün Bilgisi */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '10.5px', color: '#ff6000', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {item.category || 'FK Butik'}
                        </span>
                      </div>

                      <Link
                        href={`/urun/${item.id}`}
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#0f172a',
                          lineHeight: 1.35,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          textDecoration: 'none',
                          marginBottom: '6px',
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </Link>

                      {/* Varyant Rozetleri */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '12px' }}>
                        <span style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', color: '#475569' }}>
                          Beden: <strong style={{ color: '#0f172a' }}>{item.size}</strong>
                        </span>
                        {item.color && (
                          <span style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', color: '#475569' }}>
                            Renk: <strong style={{ color: '#0f172a' }}>{item.color}</strong>
                          </span>
                        )}
                      </div>

                      {/* Mobil Fiyat & Adet Satırı */}
                      <div className="fk-mobile-only" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                        {/* Adet Kontrolü */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#ffffff',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            style={{
                              width: '30px',
                              height: '30px',
                              border: 'none',
                              background: '#f8fafc',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '15px',
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            -
                          </button>
                          <span style={{ width: '30px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            style={{
                              width: '30px',
                              height: '30px',
                              border: 'none',
                              background: '#f8fafc',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '15px',
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            +
                          </button>
                        </div>

                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#ff6000', letterSpacing: '-0.02em' }}>
                          {(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </div>
                      </div>
                    </div>

                    {/* Masaüstü Adet Kontrolü */}
                    <div
                      className="fk-desktop-only"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#ffffff',
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: 'none',
                          background: '#f8fafc',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '16px',
                          color: '#334155',
                        }}
                      >
                        -
                      </button>
                      <span style={{ width: '34px', textAlign: 'center', fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: 'none',
                          background: '#f8fafc',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '16px',
                          color: '#334155',
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Masaüstü Fiyat ve Kaldır */}
                    <div className="fk-desktop-only" style={{ textAlign: 'right', minWidth: '110px', flexShrink: 0 }}>
                      <div style={{ fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
                        {(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '12px',
                          cursor: 'pointer',
                          marginTop: '4px',
                          fontWeight: 700,
                          padding: 0,
                        }}
                      >
                        Kaldır
                      </button>
                    </div>

                    {/* Mobil Kaldır Butonu (Sağ Üst Köşe Çarpı) */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="fk-mobile-only"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: 0,
                      }}
                      title="Ürünü Sepetten Kaldır"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* SAĞ KOLON: SİPARİŞ ÖZETİ (Masaüstünde Yapışık Sidebar, Mobilde Akıcı Kart) */}
              <div className="fk-cart-summary-col">
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '22px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    position: 'sticky',
                    top: '90px',
                    boxSizing: 'border-box',
                    width: '100%',
                  }}
                >
                  <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', letterSpacing: '0.02em' }}>
                    SİPARİŞ ÖZETİ
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13.5px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Ürünler Toplamı</span>
                      <strong style={{ color: '#0f172a' }}>{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
                    </div>

                    {couponApplied && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 700 }}>
                        <span>Kupon İndirimi (%10)</span>
                        <strong>-{discount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Kargo Ücreti</span>
                      <strong style={{ color: shipping === 0 ? '#16a34a' : '#0f172a' }}>
                        {shipping === 0 ? 'ÜCRETSİZ' : `${shipping.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`}
                      </strong>
                    </div>
                  </div>

                  {/* İndirim Kuponu Girişi */}
                  <form onSubmit={handleApplyCoupon} style={{ margin: '16px 0', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="İNDİRİM KUPONU"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        style={{
                          flex: '1 1 0',
                          minWidth: 0,
                          width: '100%',
                          height: '40px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '12px',
                          outline: 'none',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          boxSizing: 'border-box',
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          height: '40px',
                          padding: '0 16px',
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          boxSizing: 'border-box',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
                      >
                        Uygula
                      </button>
                    </div>
                    {couponError && (
                      <div style={{ color: '#dc2626', fontSize: '11.5px', marginTop: '6px', fontWeight: 600 }}>
                        {couponError}
                      </div>
                    )}
                    {couponApplied && (
                      <div style={{ color: '#16a34a', fontSize: '11.5px', marginTop: '6px', fontWeight: 700 }}>
                        ✓ %10 İndirim kuponu uygulandı!
                      </div>
                    )}
                  </form>

                  {/* Ödenecek Tutar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 20px 0' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Ödenecek Tutar</span>
                    <span style={{ fontSize: '23px', fontWeight: 900, color: '#ff6000', letterSpacing: '-0.02em' }}>
                      {finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </span>
                  </div>

                  {/* Masaüstü Siparişi Tamamla Butonu */}
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="fk-desktop-only"
                    style={{
                      width: '100%',
                      height: '48px',
                      backgroundColor: '#ff6000',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '15px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(255, 96, 0, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background-color 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e65600')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff6000')}
                  >
                    <span>Siparişi Tamamla</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* Güvenlik ve Butik Güvenceleri */}
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>256-Bit SSL Sertifikalı Güvenli Ödeme</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>Saat 16:00'ya Kadar Aynı Gün Kargo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MOBİL SEPET STICKY BAR: SADECE MOBİLDE VE SEPET DOLUYKEN AKTİF */}
      {items.length > 0 && (
        <div className="fk-cart-sticky-bar">
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {isFreeShipping ? 'Ücretsiz Kargo' : 'Toplam'}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#ff6000', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </span>
          </div>

          <button
            type="button"
            onClick={handleProceedToCheckout}
            style={{
              flex: 1,
              maxWidth: '220px',
              height: '46px',
              backgroundColor: '#ff6000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(255, 96, 0, 0.35)',
            }}
          >
            <span>Siparişi Tamamla</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
};
