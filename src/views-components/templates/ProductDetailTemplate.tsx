'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../organisms/Header';
import { Footer } from '../organisms/Footer';
import { ProductCard, ProductCardProps } from '../molecules/ProductCard';
import { ProductColorVariant } from '@/src/models/dtos';
import { CartStore } from '@/src/core/cart/cart-store';
import { useFavorites } from '@/src/core/favorites/use-favorites';

export interface ProductDetailTemplateProps {
  id: string;
  sku?: string;
  title: string;
  brandName?: string;
  category?: string;
  priceFormatted: string;
  compareAtPriceFormatted?: string;
  images: Array<{ id: string; url: string; altText?: string }>;
  sizes?: string[];
  colors?: ProductColorVariant[];
  similarProducts?: ProductCardProps[];
  modelStats?: {
    size: string;
    modelSize: string;
    height: string;
    weight: string;
    chest: string;
    waist: string;
    hips: string;
  };
  features?: Array<{ label: string; value: string }>;
  sizeTable?: Array<{ size: string; width: string; length: string }>;
  breadcrumbs?: Array<{ label: string; url?: string }>;
  stock?: number;
  categories?: any[];
  badge?: string | null;
  onAddToCart?: (variant: string, quantity: number) => void;
}

export const ProductDetailTemplate: React.FC<ProductDetailTemplateProps> = ({
  id,
  sku = '76449.1567.',
  title,
  category = 'Kadın Üst Giyim',
  priceFormatted,
  images = [],
  sizes = ['STANDART'],
  stock,
  categories,
  badge,
  colors = [
    { name: 'Siyah', imageUrl: '/images/default.jpg', inStock: true },
    { name: 'Lacivert', imageUrl: '/images/default.jpg', inStock: true },
    { name: 'Kırmızı', imageUrl: '/images/default.jpg', inStock: true },
    { name: 'Kahve', imageUrl: '/images/default.jpg', inStock: true },
  ],
  similarProducts = [],
  modelStats = {
    size: 'S',
    modelSize: '36',
    height: '172 cm',
    weight: '58 kg',
    chest: '87 cm',
    waist: '69 cm',
    hips: '92 cm',
  },
  features = [
    { label: 'Kol Tipi', value: 'Uzun Kol' },
    { label: 'Kumaş', value: 'Modal' },
    { label: 'Genişlik', value: '54 cm' },
    { label: 'Likra', value: 'Hafif Likra' },
    { label: 'Kumaş İçeriği', value: '%80 Pamuk %15 Polyester %5 Elastan' },
    { label: 'Aksesuar', value: 'Aksesuar Yok' },
    { label: 'Uzunluk', value: '57 cm' },
  ],
  sizeTable = [
    { size: 'S', width: '54 cm', length: '57 cm' },
    { size: 'M', width: '56 cm', length: '58 cm' },
    { size: 'L', width: '58 cm', length: '59 cm' },
  ],
  breadcrumbs = [
    { label: 'Ana Sayfa', url: '/' },
    { label: 'Kadın Üst Giyim', url: '/koleksiyon/gomlek-bluz' },
    { label: 'Kadın Sweat-Tunik', url: '/koleksiyon/sweat-tunik' },
    { label: title },
  ],
  onAddToCart,
}) => {
  const numericPrice = parseFloat(
    priceFormatted.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.')
  ) || 0;
  const originalPriceFormatted = numericPrice > 0
    ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Math.round(numericPrice * 1.25))
    : '';

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const currentImage = images[activeImageIndex]?.url || images[0]?.url || '/images/default.jpg';
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || 'Siyah');
  const [selectedSize, setSelectedSize] = useState(sizes[0] || 'S (36)');
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  const activeFavorite = checkIsFavorite(id);
  const [addedAlert, setAddedAlert] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showWashModal, setShowWashModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const similarSliderRef = React.useRef<HTMLDivElement>(null);
  const galleryTrackRef = React.useRef<HTMLDivElement>(null);

  const scrollToImage = (index: number) => {
    setActiveImageIndex(index);
    if (galleryTrackRef.current) {
      const width = galleryTrackRef.current.clientWidth;
      galleryTrackRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth',
      });
    }
  };

  const handleGalleryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.clientWidth > 0) {
      const newIndex = Math.round(target.scrollLeft / target.clientWidth);
      if (newIndex !== activeImageIndex && newIndex >= 0 && newIndex < images.length) {
        setActiveImageIndex(newIndex);
      }
    }
  };

  const handlePrevImage = () => {
    const nextIdx = activeImageIndex > 0 ? activeImageIndex - 1 : images.length - 1;
    scrollToImage(nextIdx);
  };

  const handleNextImage = () => {
    const nextIdx = activeImageIndex < images.length - 1 ? activeImageIndex + 1 : 0;
    scrollToImage(nextIdx);
  };

  const handleAddToCartClick = () => {
    if (stock !== undefined && stock <= 0) {
      alert('Bu ürünün stoğu tükenmiştir.');
      return;
    }

    // Fiyattan sayısal değeri hatasız çıkar
    let cleanNum = 0;
    const normalized = priceFormatted.replace(/[^\d.,]/g, '').trim();
    if (normalized.includes(',')) {
      cleanNum = parseFloat(normalized.replace(/\./g, '').replace(',', '.')) || 0;
    } else {
      cleanNum = parseFloat(normalized) || 0;
    }

    CartStore.addItem({
      productId: Number(id) || 1,
      name: title,
      category,
      price: cleanNum > 0 ? cleanNum : 499.99,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      imageUrl: currentImage,
    });

    if (onAddToCart) {
      onAddToCart(selectedSize, 1);
    }
    setAddedAlert(true);
    setShowCartModal(true);
    setTimeout(() => setAddedAlert(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header initialCategories={categories} />

      <main className="fk-pdp-main" style={{ maxWidth: '1360px', margin: '20px auto 60px', padding: '0 20px', width: '100%', boxSizing: 'border-box', flex: 1 }}>
        {/* ========================================================
           1. BREADCRUMB (Referans: Ana Sayfa > Kadın Üst Giyim > ...)
           ======================================================== */}
        <nav
          className="fk-breadcrumbs-nav"
          style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              {b.url ? (
                <Link href={b.url} style={{ color: '#64748b', textDecoration: 'none' }} itemProp="item">
                  <span itemProp="name">{b.label}</span>
                </Link>
              ) : (
                <span style={{ color: '#0f172a', fontWeight: 600 }} itemProp="name">{b.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <span>&gt;</span>}
            </React.Fragment>
          ))}
        </nav>

        {/* ========================================================
           2. ANA DETAY ALANI (Sol: Galeri & Medya, Sağ: Satın Alma)
           ======================================================== */}
        <div className="fk-detail-grid">
          {/* SOL KOLON: GÖRSEL VE MEDYA GALERİSİ */}
          <div className="fk-pdp-gallery-col" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
            {/* Büyük Portre Görsel Alanı (Masaüstünde şık kart, mobilde %100 kenardan kenara tam responsive) */}
            <div
              className="fk-gallery-wrapper"
              style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
            >
              {/* Swipeable Carousel Track */}
              <div
                ref={galleryTrackRef}
                className="fk-gallery-track"
                onScroll={handleGalleryScroll}
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  width: '100%',
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="fk-gallery-slide"
                    style={{
                      flex: '0 0 100%',
                      width: '100%',
                      scrollSnapAlign: 'start',
                      position: 'relative',
                      aspectRatio: '3 / 4',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`${title} - Görsel ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        display: 'block',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Sol Üst: Yönetici "En Çok Satan" rozeti eklediyse dairesel turuncu rozet */}
              {badge && (badge.toLowerCase().includes('çok satan') || badge.toLowerCase().includes('en cok')) && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#ff6000',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: '9px',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    padding: '4px',
                    boxShadow: '0 4px 12px rgba(255, 96, 0, 0.4)',
                    zIndex: 10,
                    textTransform: 'uppercase',
                    border: '2px solid #ffffff',
                    transform: 'rotate(-8deg)',
                    pointerEvents: 'none',
                  }}
                >
                  <span>EN ÇOK</span>
                  <span>SATAN</span>
                </div>
              )}

              {/* Sağ Üst: Siyah SKU Rozeti (76449.1567.) */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              >
                {sku}
              </div>

              {/* Sol & Sağ Kaydırma Butonları (< >) - Mobilde görseli kapatmaması için sadece masaüstünde görünür */}
              <button
                type="button"
                onClick={handlePrevImage}
                className="fk-desktop-only"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 10,
                }}
                aria-label="Önceki Görsel"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleNextImage}
                className="fk-desktop-only"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 10,
                }}
                aria-label="Sonraki Görsel"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Sol Alt: '▶ VİDEO' Turuncu Butonu */}
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  backgroundColor: '#ff6000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 4px 12px rgba(255, 96, 0, 0.4)',
                  zIndex: 10,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffffff">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>VİDEO</span>
              </button>

              {/* Sayfalama Nokta Göstergeleri (Trendyol / Zara Dot Indicators) */}
              {images.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(15, 23, 42, 0.45)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10,
                  }}
                >
                  {images.map((_, dotIdx) => (
                    <span
                      key={dotIdx}
                      onClick={() => scrollToImage(dotIdx)}
                      style={{
                        width: activeImageIndex === dotIdx ? '16px' : '6px',
                        height: '6px',
                        borderRadius: '3px',
                        backgroundColor: activeImageIndex === dotIdx ? '#ff6000' : 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Sağ Alt: '1 / 4' Görsel Sayaç Rozeti (Modern Mobil Standart) */}
              {images.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  {activeImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Yatay Küçük Önizleme Thumbnail Galerisi */}
            <div
              className="fk-thumbnail-row"
              style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}
            >
              {images.map((img, idx) => {
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => scrollToImage(idx)}
                    style={{
                      width: '64px',
                      height: '84px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: isActive ? '2px solid #ff6000' : '1px solid #e2e8f0',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      backgroundColor: '#f8fafc',
                      outline: 'none',
                      boxShadow: isActive ? '0 0 0 1px #ff6000' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* SAĞ KOLON: ÜRÜN BİLGİSİ & SATIN ALMA EYLEMLERİ */}
          <div className="fk-pdp-content-col" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Ürün Başlığı & Model Kodu */}
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
              {title}
            </h1>

            {/* Yönetici Tarafından Eklenmiş Bilgi Kartı / Rozet (Varsayılan olarak rozetsizdir, sadece varsa gösterilir) */}
            {badge && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  width: 'fit-content',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626' }}>
                  {badge}
                </span>
                <span style={{ fontSize: '13px', color: '#dc2626', cursor: 'pointer' }} title={badge}>ⓘ</span>
              </div>
            )}

            {/* Fiyat Kutusu (Referans: Açık Turuncu Zeminli 319,99 TL) */}
            <div>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#fff7ed',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: '1px solid #ffedd5',
                }}
              >
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#ff6000', letterSpacing: '-0.02em' }}>
                  {priceFormatted}
                </span>
              </div>
            </div>

            {/* Renk Seçenekleri */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Renk: <span style={{ fontWeight: 500, color: '#64748b' }}>{selectedColor}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <a
                      key={c.name}
                      href={c.slug || '#'}
                      onClick={(e) => {
                        if (!c.slug) {
                          e.preventDefault();
                        }
                        setSelectedColor(c.name);
                      }}
                      style={{
                        display: 'block',
                        width: '52px',
                        height: '66px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: isSelected ? '2px solid #ff6000' : '1px solid #e2e8f0',
                        padding: '2px',
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        boxShadow: isSelected ? '0 0 0 1px #ff6000' : 'none',
                        transition: 'all 0.15s ease',
                        textDecoration: 'none',
                      }}
                      title={c.name}
                    >
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Beden Seçimi & Beden Tablosu Linkleri */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Beden: <span style={{ color: '#ff6000' }}>{selectedSize}</span>
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSizeModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    <span>Beden Tablosu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSizeModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff6000',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>📐 Bedenimi Hesapla</span>
                  </button>
                </div>
              </div>

              {/* Beden Butonları (S (36) | M (38) | L (40)) */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #ff6000' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                        color: isSelected ? '#ff6000' : '#1e293b',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MASAÜSTÜ SAYFA İÇİ SEPETE EKLE BUTONU (Sayfa İçinde, Bedenlerin Hemen Altında) */}
            <div className="fk-desktop-only" style={{ marginTop: '16px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={handleAddToCartClick}
                disabled={stock !== undefined && stock <= 0}
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: stock !== undefined && stock <= 0 ? '#94a3b8' : addedAlert ? '#16a34a' : '#ff6000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '16px',
                  cursor: stock !== undefined && stock <= 0 ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(255, 96, 0, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.01em',
                }}
                onMouseOver={(e) => {
                  if (stock === undefined || stock > 0) {
                    e.currentTarget.style.backgroundColor = addedAlert ? '#15803d' : '#e65600';
                  }
                }}
                onMouseOut={(e) => {
                  if (stock === undefined || stock > 0) {
                    e.currentTarget.style.backgroundColor = addedAlert ? '#16a34a' : '#ff6000';
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>{stock !== undefined && stock <= 0 ? 'Tükendi' : addedAlert ? 'Sepete Eklendi!' : 'Sepete Ekle'}</span>
              </button>
            </div>

            {/* Aksiyon Butonları: [WhatsApp] [Favori] [Paylaş] - Sola Yaslı Modern Butonlar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', justifyContent: 'flex-start' }}>
              {/* WhatsApp Butonu */}
              <a
                href={`https://wa.me/905327805100?text=${encodeURIComponent(`Merhaba, "${title}" ürünü hakkında bilgi almak istiyorum.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#25d366',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
                title="WhatsApp ile Sor"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>

              {/* Favori Kalp Butonu */}
              <button
                type="button"
                onClick={() => {
                  toggleFavorite({
                    id: String(id),
                    name: title,
                    priceFormatted,
                    imageUrl: currentImage,
                    category,
                    slug: `/urun/${id}`,
                  });
                }}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '8px',
                  border: activeFavorite ? '1.5px solid #ff6000' : '1.5px solid #e2e8f0',
                  backgroundColor: activeFavorite ? '#fff7ed' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: activeFavorite ? '#ff6000' : '#64748b',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
                title={activeFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={activeFavorite ? '#ff6000' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* Paylaş Butonu */}
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Ürün bağlantısı panoya kopyalandı!');
                  }
                }}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
                title="Ürünü Paylaş"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>

            {/* ========================================================
               GÜVEN VE TESLİMAT BİLGİ KARTLARI (SİPARİŞLERİNİZ, İADE, ÖDEME, GÜVENLİK)
               ======================================================== */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                margin: '20px 0 10px 0',
                padding: '16px 18px',
                backgroundColor: '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: '14px',
              }}
            >
              {/* 1. SİPARİŞLERİNİZ - 24 Saatte Kargoda */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#fff7ed',
                    border: '1.5px solid #ffedd5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    SİPARİŞLERİNİZ
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>
                    24 Saatte Kargoda
                  </div>
                </div>
              </div>

              {/* 2. İADE - 14 Gün Koşulsuz İade */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#fff7ed',
                    border: '1.5px solid #ffedd5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    İADE
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>
                    14 Gün Koşulsuz İade
                  </div>
                </div>
              </div>

              {/* 3. ÖDEME - Kapıda Ödeme Kolaylığı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#fff7ed',
                    border: '1.5px solid #ffedd5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    ÖDEME
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>
                    Kapıda Ödeme Kolaylığı
                  </div>
                </div>
              </div>

              {/* 4. GÜVENLİK - %100 Güvenli Ödeme Sayfası */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#fff7ed',
                    border: '1.5px solid #ffedd5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    GÜVENLİK
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>
                    %100 Güvenli Ödeme Sayfası
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
               3. ÖNE ÇIKAN ÖZELLİKLER (Görsel 2: 2x4 Kart Grid)
               ======================================================== */}
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                Öne Çıkan Özellikler:
              </h3>

              <div className="fk-features-grid">
                {features.map((f, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{f.label}</span>
                    <strong style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: 700 }}>{f.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* ========================================================
               4. MODEL VE MANKEN ÖLÇÜLERİ (Görsel 2)
               ======================================================== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#334155', marginTop: '12px' }}>
              <div>
                <span style={{ color: '#ff6000', marginRight: '6px' }}>•</span>
                Görseldeki Ürünün Bedeni: <strong>{modelStats.size}</strong>
              </div>
              <div>
                <span style={{ color: '#ff6000', marginRight: '6px' }}>•</span>
                Mankenin Kendi Bedeni: <strong>{modelStats.modelSize}</strong>
              </div>
              <div>
                <span style={{ color: '#ff6000', marginRight: '6px' }}>•</span>
                Modelin Ölçüleri: Boy: <strong>{modelStats.height}</strong>, Kilo: <strong>{modelStats.weight}</strong>, Göğüs: <strong>{modelStats.chest}</strong>, Bel: <strong>{modelStats.waist}</strong>, Kalça: <strong>{modelStats.hips}</strong>
              </div>
            </div>

            {/* Aksiyon Tab Butonları */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('tum-ozellikler');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  height: '42px',
                  padding: '0 20px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Ürünün Tüm Özellikleri
              </button>

              <button
                type="button"
                onClick={() => setShowWashModal(true)}
                style={{
                  height: '42px',
                  padding: '0 20px',
                  backgroundColor: '#ffffff',
                  color: '#ff6000',
                  border: '1.5px solid #ff6000',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>Yıkama Talimatları</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
           5. BENZER ÜRÜNLER SLIDER BÖLÜMÜ (Görsel 3 / 7: 5'li Slider & Nav Okları)
           ======================================================== */}
        <section className="fk-pdp-bottom-section" style={{ marginTop: '72px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Benzer Ürünler
            </h2>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Sol Kaydırma Butonu (<) */}
            <button
              type="button"
              onClick={() => handleSimilarScroll('left')}
              className="fk-desktop-only"
              style={{
                position: 'absolute',
                left: '-16px',
                top: '40%',
                transform: 'translateY(-50%)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                zIndex: 4,
              }}
              aria-label="Önceki Benzer Ürünler"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Sağ Kaydırma Butonu (>) */}
            <button
              type="button"
              onClick={() => handleSimilarScroll('right')}
              className="fk-desktop-only"
              style={{
                position: 'absolute',
                right: '-16px',
                top: '40%',
                transform: 'translateY(-50%)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                zIndex: 4,
              }}
              aria-label="Sonraki Benzer Ürünler"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div
              ref={similarSliderRef}
              className="fk-similar-slider"
            >
              {similarProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  {...p}
                  badgeText={p.badgeText || undefined}
                  badgeColor={p.badgeColor || '#ef4444'}
                  priceColor={p.priceColor || '#ff6000'}
                  hideSizes={p.hideSizes ?? true}
                  categoryName={p.categoryName || ''}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
           6. DETAYLI ÜRÜN ÖZELLİKLERİ & BEDEN TABLOSU (Görsel 4)
           ======================================================== */}
        <div id="tum-ozellikler" className="fk-pdp-bottom-section" style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Ürün Özellikleri Kartı */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0' }}>
              Ürün Özellikleri
            </h3>

            <div className="fk-all-features-grid">
              {features.map((f, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{f.label}</span>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: 700 }}>{f.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Beden Ölçüleri Tablosu */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0' }}>
              Beden Ölçüleri
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Beden</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Genişlik</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Uzunluk</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeTable.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < sizeTable.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{row.size}</td>
                      <td style={{ padding: '14px 16px', color: '#334155' }}>{row.width}</td>
                      <td style={{ padding: '14px 16px', color: '#334155' }}>{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Geri Bildirim Ver Butonu (Referans Görsel 4: Tam Genişlik) */}
          <button
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            style={{
              width: '100%',
              height: '50px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            <span>Geri Bildirim Ver</span>
          </button>
        </div>

        {/* SABİT ALT SATIN ALMA BARI (SADECE MOBİL VERSİYON İÇİN AKTİF) */}
        <div className="fk-mobile-sticky-buy-bar fk-mobile-only">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '1360px', width: '100%', margin: '0 auto', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <img
                src={currentImage}
                alt={title}
                className="fk-desktop-only"
                style={{
                  width: '42px',
                  height: '52px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center' }}>
                <span className="fk-desktop-only" style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
                  {title}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  {badge ? (
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                      <span>{badge}</span>
                    </div>
                  ) : null}
                  <span className="fk-desktop-only" style={{ fontSize: '12px', color: '#64748b' }}>
                    Beden: <strong style={{ color: '#0f172a' }}>{selectedSize}</strong>
                  </span>
                  {badge && originalPriceFormatted ? (
                    <span style={{ fontSize: '12.5px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                      {originalPriceFormatted}
                    </span>
                  ) : null}
                  <span style={{ fontSize: '19px', fontWeight: 900, color: badge ? '#dc2626' : '#ff6000', letterSpacing: '-0.02em' }}>
                    {priceFormatted}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCartClick}
              disabled={stock !== undefined && stock <= 0}
              className="fk-pdp-sticky-add-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '6px' }}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>{stock !== undefined && stock <= 0 ? 'Tükendi' : addedAlert ? 'Sepete Eklendi!' : 'Sepete Ekle'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* ========================================================
         7. ETKİLEŞİMLİ MODALLAR (Beden, Video, Yıkama, Geri Bildirim)
         ======================================================== */}
      {/* Beden Tablosu & Hesaplayıcı Modalı */}
      {showSizeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowSizeModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Beden Ölçü Tablosu
              </h3>
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Doğru beden seçimi için göğüs ve boy ölçülerinizi aşağıdaki tablo ile karşılaştırabilirsiniz.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px 12px' }}>Beden</th>
                  <th style={{ padding: '8px 12px' }}>Genişlik (cm)</th>
                  <th style={{ padding: '8px 12px' }}>Uzunluk (cm)</th>
                </tr>
              </thead>
              <tbody>
                {sizeTable.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{s.size}</td>
                    <td style={{ padding: '10px 12px' }}>{s.width}</td>
                    <td style={{ padding: '10px 12px' }}>{s.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yıkama Talimatları Modalı */}
      {showWashModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowWashModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Yıkama ve Bakım Talimatları
              </h3>
              <button
                type="button"
                onClick={() => setShowWashModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <ul style={{ fontSize: '13px', color: '#334155', lineHeight: 1.8, paddingLeft: '18px', margin: 0 }}>
              <li>30 derecede hassas programda tersten yıkayınız.</li>
              <li>Ağartıcı veya klorlu deterjan kullanmayınız.</li>
              <li>Kurutma makinesinde kurutmayınız, sererek kurutunuz.</li>
              <li>Düşük ısıda tersten ütüleyiniz.</li>
              <li>Benzer renklerle birlikte yıkamanız tavsiye edilir.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Video Modalı */}
      {showVideoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowVideoModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Ürün Canlı Tanıtım Videosu</h3>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', paddingTop: '133%', backgroundColor: '#0f172a' }}>
              <img
                src={currentImage}
                alt="Video önizleme"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '12px',
                  color: '#ffffff',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#ff6000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(255, 96, 0, 0.5)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>360° Manken Üzerinde Duruş</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geri Bildirim Modalı */}
      {showFeedbackModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Ürün Hakkında Geri Bildirim
              </h3>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {feedbackSent ? (
              <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#16a34a', textAlign: 'center', fontWeight: 700 }}>
                Geri bildiriminiz başarıyla iletildi. Teşekkür ederiz!
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFeedbackSent(true);
                  setTimeout(() => {
                    setShowFeedbackModal(false);
                    setFeedbackSent(false);
                    setFeedbackText('');
                  }, 2000);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Bu ürünün fiyatı, kumaşı veya görseliyle ilgili önerinizi bizimle paylaşabilirsiniz.
                </p>
                <textarea
                  required
                  rows={4}
                  placeholder="Görüş ve önerilerinizi buraya yazabilirsiniz..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: '44px',
                    backgroundColor: '#ff6000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Gönder
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
         8. SEPETE EKLENDİ BİLGİ KARTI MODALI (Hızlı, Şık, Optimize)
         ======================================================== */}
      {showCartModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fkFadeIn 0.2s ease-out',
          }}
          onClick={() => setShowCartModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              animation: 'fkScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setShowCartModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              aria-label="Kapat"
            >
              ✕
            </button>

            {/* Başlık & Başarı İkonu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Ürün Sepete Eklendi!
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Seçtiğiniz ürün sepetinize başarıyla eklendi.
                </p>
              </div>
            </div>

            {/* Ürün Bilgi Kartı */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <img
                src={currentImage}
                alt={title}
                style={{
                  width: '64px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '0 0 6px 0',
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={title}
                >
                  {title}
                </h4>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                  <span>Beden: <strong style={{ color: '#0f172a' }}>{selectedSize}</strong></span>
                  {selectedColor && (
                    <span>• Renk: <strong style={{ color: '#0f172a' }}>{selectedColor}</strong></span>
                  )}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#ff6000' }}>
                  {priceFormatted}
                </div>
              </div>
            </div>

            {/* Aksiyon Butonları: Alışverişe Devam Et & Sepete Git (Taşmayan, Tam Orantılı ve Şık) */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowCartModal(false)}
                style={{
                  flex: '1.2 1 0',
                  minWidth: 0,
                  height: '46px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              >
                Alışverişe Devam Et
              </button>

              <Link
                href="/sepet"
                onClick={() => setShowCartModal(false)}
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  height: '46px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#ff6000',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  padding: '0 8px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(255, 96, 0, 0.35)',
                  transition: 'background-color 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e65600')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff6000')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>Sepete Git</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
