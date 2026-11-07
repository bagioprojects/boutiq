'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '../organisms/Header';
import { Footer } from '../organisms/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'FK-' + Date.now().toString().slice(-6);
  const total = searchParams.get('total') || '';
  const cargo = searchParams.get('cargo') || 'Yurtiçi Kargo';

  return (
    <main style={{ maxWidth: '640px', margin: '40px auto 80px', padding: '0 20px', width: '100%', flex: 1, boxSizing: 'border-box' }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '40px 28px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
        }}
      >
        {/* Yeşil Başarı Rozeti */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 16px rgba(22, 163, 74, 0.2)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0' }}>
          Siparişiniz Başarıyla Alındı!
        </h1>
        <p style={{ fontSize: '14.5px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
          Tebrikler! Siparişiniz güvenle oluşturuldu ve hazırlık aşamasına alındı. Kargo takip bilgileri SMS ve e-posta ile tarafınıza iletilecektir.
        </p>

        {/* Sipariş No Kutusu */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Sipariş Numaranız
          </span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#ff6000', letterSpacing: '1px' }}>
            {orderNumber}
          </span>
          {total && (
            <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
              Toplam Tutar: <strong>{Number(total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
            </span>
          )}
          {cargo && (
            <div style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12.5px', color: '#0f172a', fontWeight: 700 }}>
              <span>🚚 Teslimat:</span>
              <span style={{ color: cargo.includes('MNG') ? '#2563eb' : '#ff6000' }}>{cargo}</span>
            </div>
          )}
        </div>

        {/* Butonlar */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              flex: 1,
              height: '48px',
              backgroundColor: '#ff6000',
              color: '#ffffff',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '14.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(255, 96, 0, 0.35)',
            }}
          >
            Alışverişe Devam Et
          </Link>

          <Link
            href="/hesap"
            style={{
              flex: 1,
              height: '48px',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            Siparişlerimi Görüntüle
          </Link>
        </div>
      </div>
    </main>
  );
}

export const OrderSuccessTemplate: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px' }}>Yükleniyor...</div>}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
};

