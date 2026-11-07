'use client';

import React from 'react';
import Link from 'next/link';
import { FKButikLogo } from '../atoms/FKButikLogo';
import { SeoLink } from '../primitives/SeoLink';
import { CookieConsentService } from '@/src/core/cookies/cookie-consent.service';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FK Butik',
    alternateName: 'FK Butik Kadın Giyim',
    url: 'https://fkbutik.com',
    logo: 'https://fkbutik.com/images/fkbutik-logo.svg',
    description: 'Modern, yüksek kaliteli ve seçkin kadın giyim koleksiyonları. Elbise, bluz, pantolon ve aksesuarda şıklığın adresi.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'İstanbul',
      addressCountry: 'TR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-532-780-51-00',
      contactType: 'customer service',
      areaServed: 'TR',
      availableLanguage: 'Turkish',
    },
    sameAs: [
      'https://www.instagram.com/fkbutik',
    ],
  };

  return (
    <footer
      className="fk-site-footer"
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '60px 24px 32px',
        borderTop: '1px solid #1e293b',
      }}
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      {/* Schema.org Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
        }}
      >
        {/* KOLON 1: LOGO, HAKKIMIZDA & İLETİŞİM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SeoLink href="/" aria-label="FK Butik Ana Sayfa">
            <FKButikLogo variant="light" width={180} height={46} />
          </SeoLink>

          <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
            Modern, seçkin ve yüksek kaliteli kadın giyim koleksiyonları. Günlük şıklıktan abiyeye, en trend parçalar güvenli alışveriş ve hızlı kargo ile kapınızda.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', fontSize: '13px', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#ff6000' }}>📞</span>
              <a href="tel:+905327805100" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                +90 (532) 780 51 00
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#25d366' }}>💬</span>
              <a
                href="https://wa.me/905327805100"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#cbd5e1', textDecoration: 'none' }}
              >
                WhatsApp Müşteri Destek Hattı
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#ff6000' }}>✉️</span>
              <a href="mailto:destek@fkbutik.com" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                destek@fkbutik.com
              </a>
            </div>
          </div>
        </div>

        {/* KOLON 2: POPÜLER KATEGORİLER */}
        <div>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 18px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Kategoriler
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13.5px' }}>
            <li><SeoLink href="/koleksiyon/elbise" style={{ color: '#94a3b8', textDecoration: 'none' }}>Elbise Modelleri</SeoLink></li>
            <li><SeoLink href="/koleksiyon/gunluk-elbise" style={{ color: '#94a3b8', textDecoration: 'none' }}>Günlük & Triko Elbiseler</SeoLink></li>
            <li><SeoLink href="/koleksiyon/gomlek-bluz" style={{ color: '#94a3b8', textDecoration: 'none' }}>Gömlek & Bluz</SeoLink></li>
            <li><SeoLink href="/koleksiyon/pantolon" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pantolon & Jean</SeoLink></li>
            <li><SeoLink href="/koleksiyon/etek" style={{ color: '#94a3b8', textDecoration: 'none' }}>Etek Modelleri</SeoLink></li>
            <li><SeoLink href="/koleksiyon/takim" style={{ color: '#94a3b8', textDecoration: 'none' }}>İkili Takımlar</SeoLink></li>
            <li><SeoLink href="/koleksiyon/aksesuar" style={{ color: '#94a3b8', textDecoration: 'none' }}>Aksesuar & Çanta</SeoLink></li>
          </ul>
        </div>

        {/* KOLON 3: ÖZEL KOLEKSİYONLAR & TRENDLER */}
        <div>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 18px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Koleksiyonlar
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13.5px' }}>
            <li><SeoLink href="/koleksiyon/yeni-gelenler" style={{ color: '#94a3b8', textDecoration: 'none' }}>Yeni Gelen Parçalar</SeoLink></li>
            <li><SeoLink href="/koleksiyon/cok-satanlar" style={{ color: '#94a3b8', textDecoration: 'none' }}>Çok Satanlar (Best Sellers)</SeoLink></li>
            <li><SeoLink href="/koleksiyon/firsat-urunleri" style={{ color: '#ff6000', fontWeight: 700, textDecoration: 'none' }}>Fırsat Ürünleri</SeoLink></li>
            <li><SeoLink href="/koleksiyon/ofis-sikligi" style={{ color: '#94a3b8', textDecoration: 'none' }}>Ofis & İş Stili</SeoLink></li>
            <li><SeoLink href="/koleksiyon/sik-abiye-elbise" style={{ color: '#94a3b8', textDecoration: 'none' }}>Şık & Abiye Tasarımlar</SeoLink></li>
            <li><SeoLink href="/koleksiyon/triko" style={{ color: '#94a3b8', textDecoration: 'none' }}>Kışlık Triko Koleksiyonu</SeoLink></li>
          </ul>
        </div>

        {/* KOLON 4: MÜŞTERİ HİZMETLERİ & GÜVENLİK */}
        <div>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 18px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Müşteri Hizmetleri
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13.5px' }}>
            <li><SeoLink href="/sayfa/teslimat-ve-kargo" style={{ color: '#94a3b8', textDecoration: 'none' }}>Teslimat & Kargo Takibi</SeoLink></li>
            <li><SeoLink href="/sayfa/kolay-iade" style={{ color: '#94a3b8', textDecoration: 'none' }}>14 Gün Kolay İade & Değişim</SeoLink></li>
            <li><SeoLink href="/sayfa/gizlilik-politikasi" style={{ color: '#94a3b8', textDecoration: 'none' }}>Gizlilik Politikası & KVKK</SeoLink></li>
            <li>
              <button
                type="button"
                onClick={() => CookieConsentService.openSettings()}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#94a3b8',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'inherit',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#ff6000')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <span>🍪</span>
                <span>Çerez Tercihlerini Yönet</span>
              </button>
            </li>
            <li><SeoLink href="/sayfa/mesafeli-satis-sozlesmesi" style={{ color: '#94a3b8', textDecoration: 'none' }}>Mesafeli Satış Sözleşmesi</SeoLink></li>
            <li><SeoLink href="/sayfa/iletisim" style={{ color: '#94a3b8', textDecoration: 'none' }}>İletişim & Lokasyon</SeoLink></li>
          </ul>

          <div style={{ marginTop: '20px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              GÜVENLİ ÖDEME SİSTEMLERİ
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', fontWeight: 700 }}>
                🔒 256-Bit SSL
              </span>
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', fontWeight: 700 }}>
                💳 Visa / MasterCard
              </span>
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', fontWeight: 700 }}>
                🇹🇷 Troy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ALT TELİF & YASAL METİN BARI */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '48px auto 0',
          paddingTop: '24px',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12.5px',
          color: '#64748b',
        }}
      >
        <span>
          © {currentYear} <strong>FK Butik</strong>. Tüm hakları saklıdır.
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <SeoLink href="/sayfa/gizlilik-politikasi" style={{ color: '#64748b', textDecoration: 'none' }}>
            Gizlilik
          </SeoLink>
          <button
            type="button"
            onClick={() => CookieConsentService.openSettings()}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#64748b',
              fontSize: '12.5px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#ff6000')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            Çerez Tercihleri
          </button>
          <SeoLink href="/sayfa/mesafeli-satis-sozlesmesi" style={{ color: '#64748b', textDecoration: 'none' }}>
            Satış Koşulları
          </SeoLink>
          <SeoLink href="/sayfa/iletisim" style={{ color: '#64748b', textDecoration: 'none' }}>
            Destek
          </SeoLink>
        </div>
      </div>
    </footer>
  );
};
