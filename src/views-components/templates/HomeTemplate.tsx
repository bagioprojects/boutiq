'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../organisms/Header';
import { Footer } from '../organisms/Footer';
import { ProductCard, ProductCardProps } from '../molecules/ProductCard';

export interface HomeTemplateProps {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  featuredProducts: ProductCardProps[];
  categories?: any[];
}

export const HomeTemplate: React.FC<HomeTemplateProps> = ({
  heroTitle = 'Yeni Sezon Zarafeti',
  heroSubtitle = 'FK Butik ile en trend kadın giyim modelleri, seçkin kumaşlar ve zarif detaylarla stilinizi keşfedin.',
  featuredProducts,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'popular'>('all');
  const [liveCategories, setLiveCategories] = useState<any[]>(categories || []);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setLiveCategories(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const storyCategories = [
    {
      id: 'yeni-urunler',
      line1: 'YENİ',
      line2: 'ÜRÜNLER',
      url: '/koleksiyon/yeni-urunler',
      img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=240&auto=format&fit=crop&q=80',
    },
    {
      id: 'cok-satanlar',
      line1: 'ÇOK',
      line2: 'SATANLAR',
      url: '/koleksiyon/cok-satanlar',
      img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=240&auto=format&fit=crop&q=80',
    },
    {
      id: 'sezon-sonu',
      line1: 'SEZON SONU',
      line2: 'ÜRÜNLER',
      url: '/koleksiyon/sezon-sonu',
      img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=240&auto=format&fit=crop&q=80',
    },
  ];

  // Filtrelenmiş veya sekmeli ürünler
  const displayedProducts = featuredProducts.slice(0, 20);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fcfcfd' }}>
      <Header initialCategories={categories} />

      <main style={{ flex: 1 }}>
        {/* 1. HİKAYELER / 3 ÖZEL KATEGORİ DAİRESİ (SADECE MOBİLDE GÖRÜNÜR, TAM ORTALANMIŞ & SİMETRİK) */}
        <section className="fk-story-section">
          <div className="fk-container">
            <div className="fk-story-scroll-wrap">
              {storyCategories.map((story) => (
                <Link
                  key={story.id}
                  href={story.url}
                  className="fk-story-item"
                >
                  <div className="fk-story-circle">
                    <img
                      src={story.img}
                      alt={`${story.line1} ${story.line2}`}
                    />
                  </div>
                  <span className="fk-story-title">
                    <span className="fk-story-line1">{story.line1}</span>
                    <span className="fk-story-line2">{story.line2}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 2. MODERN FASHION HERO BANNER (Dinamik ve Lüks Görünüm) */}
        <section
          style={{
            position: 'relative',
            backgroundColor: '#111827',
            backgroundImage: 'linear-gradient(rgba(17, 24, 39, 0.45), rgba(17, 24, 39, 0.65)), url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            color: '#ffffff',
            padding: '70px 20px',
            textAlign: 'center',
            minHeight: '380px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ maxWidth: '820px', margin: '0 auto', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(255, 96, 0, 0.95)',
                color: '#ffffff',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                marginBottom: '14px',
                textTransform: 'uppercase',
              }}
            >
              YENİ SEZON KOLEKSİYONU
            </span>
            <h1
              style={{
                fontSize: 'clamp(28px, 5vw, 46px)',
                fontWeight: 900,
                margin: '0 0 14px 0',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {heroTitle}
            </h1>
            <p
              style={{
                fontSize: 'clamp(14px, 2.5vw, 17px)',
                color: '#f3f4f6',
                lineHeight: 1.6,
                marginBottom: '24px',
                maxWidth: '640px',
                margin: '0 auto 24px',
              }}
            >
              {heroSubtitle}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/koleksiyon/yeni-gelenler"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  fontSize: '14px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                Koleksiyonu Keşfet →
              </Link>
              <Link
                href="/koleksiyon/elbise"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  fontSize: '14px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Elbise Modelleri
              </Link>
            </div>
          </div>
        </section>

        {/* 4. GERÇEK ÜRÜNLER VİTRİNİ & GRID BÖLÜMÜ */}
        <section style={{ maxWidth: '1320px', margin: '40px auto 60px', padding: '0 16px' }}>
          {/* Başlık ve Kategori Sekmeleri */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#ff6000', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  ÖNE ÇIKAN PARÇALAR
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0', letterSpacing: '-0.01em' }}>
                  Haftanın En Çok Beğenilen Modelleri
                </h2>
              </div>

              <Link
                href="/koleksiyon/yeni-gelenler"
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#ff6000',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Tüm Ürünleri İncele</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Otomatik Responsive Ürün Grid'i (4 Kolon Masaüstü, 3 Kolon Tablet, 2 Kolon Mobil) */}
          <div className="fk-product-grid">
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>

          {/* Alt Çağrı Banner'ı */}
          <div
            style={{
              marginTop: '48px',
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              padding: '36px 24px',
              color: '#ffffff',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
            }}
          >
            <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
              Tarzınıza Uygun Yeni Modelleri Kaçırmayın!
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, maxWidth: '580px' }}>
              500 TL üzeri siparişlerde kargo ücretsiz, saat 16:00'ya kadar aynı gün sevk fırsatıyla kapınızda.
            </p>
            <Link
              href="/koleksiyon/yeni-gelenler"
              style={{
                backgroundColor: '#ff6000',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 800,
                textDecoration: 'none',
                marginTop: '6px',
              }}
            >
              Alışverişe Başla
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
