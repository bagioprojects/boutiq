'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AccountLayout } from '@/src/views-components/account/AccountLayout';
import { Ticket, Copy, Check, ArrowRight, Sparkles, Percent, Tag } from 'lucide-react';

interface Coupon {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  expires_at?: string;
}

export default function AccountCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/coupons')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.coupons)) {
          setCoupons(d.coupons);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <AccountLayout
      title="İndirim Kuponlarım & Fırsatlar"
      subtitle="Hesabınıza tanımlı indirim kuponlarını sepetinizde uygulayarak indirimli alışverişin keyfini çıkarın."
    >
      <div>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Kuponlar yükleniyor...
          </div>
        ) : coupons.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              padding: '50px 24px',
              textAlign: 'center',
            }}
          >
            <Ticket size={42} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Şu Anda Aktif Kupon Bulunmuyor
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', maxWidth: '420px', marginInline: 'auto' }}>
              Dönemsel kampanyalar ve size özel indirim kuponları burada listelenecektir.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#ff6000',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Koleksiyonları Keşfet
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {coupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code;
              const isPercent = coupon.discount_type === 'percent';
              const discountText = isPercent ? `%${coupon.discount_value} İndirim` : `${coupon.discount_value} ₺ İndirim`;

              return (
                <div
                  key={coupon.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '2px dashed #fed7aa',
                    padding: '24px',
                    boxShadow: '0 2px 6px rgba(255, 96, 0, 0.05)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Üst Rozet */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#fff7ed',
                          color: '#ea580c',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        <Sparkles size={13} />
                        <span>FIRSAT KODU</span>
                      </div>

                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                        ● Kullanıma Hazır
                      </span>
                    </div>

                    {/* İndirim Tutarı */}
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#ff6000', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                      {discountText}
                    </div>

                    {/* Şart / Açıklama */}
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                      {coupon.min_order_amount > 0 ? (
                        <>
                          <strong style={{ color: '#0f172a' }}>{coupon.min_order_amount.toLocaleString('tr-TR')} ₺</strong> ve üzeri tüm siparişlerde geçerlidir.
                        </>
                      ) : (
                        'Alt limit olmaksızın tüm siparişlerde geçerlidir.'
                      )}
                    </p>

                    {/* Kupon Kodu Kutusu */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '10px',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={16} style={{ color: '#ff6000' }} />
                        <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', letterSpacing: '0.08em' }}>
                          {coupon.code}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(coupon.code)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: `1px solid ${isCopied ? '#86efac' : '#cbd5e1'}`,
                          backgroundColor: isCopied ? '#dcfce7' : '#ffffff',
                          color: isCopied ? '#16a34a' : '#334155',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{isCopied ? 'Kopyalandı' : 'Kopyala'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sepette Kullan Butonu */}
                  <Link
                    href="/sepet"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 800,
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ff6000')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
                  >
                    <span>Sepette Uygula</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Bilgilendirme Kutusu */}
        <div
          style={{
            marginTop: '28px',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
          }}
        >
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Kuponlarımı Nasıl Kullanırım?
          </h4>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            Kupon kodunuzu kopyalayın, alışveriş sepetinize gidin ve Sipariş Özeti altında yer alan <strong>"İNDİRİM KUPONU"</strong> kutucuğuna yapıştırıp <strong>"Uygula"</strong> butonuna basın. İndirim tutarınız anında sepet toplamınıza yansıtılacaktır.
          </p>
        </div>
      </div>
    </AccountLayout>
  );
}

