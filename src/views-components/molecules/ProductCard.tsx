'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/src/core/favorites/use-favorites';

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  priceFormatted?: string;
  price?: number;
  compareAtPriceFormatted?: string;
  brandName?: string;
  categoryName?: string;
  isNew?: boolean;
  hasVideo?: boolean;
  badgeText?: string;
  badgeColor?: string;
  colorCount?: number;
  availableSizes?: string[];
  hideSizes?: boolean;
  rating?: number;
  reviewCount?: number;
  hasPhotoReview?: boolean;
  priceColor?: string;
  onAddToCart?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  slug,
  imageUrl,
  priceFormatted,
  price,
  compareAtPriceFormatted,
  categoryName = 'Kadın Üst Giyim',
  hasVideo = true,
  badgeText,
  badgeColor = '#ef4444',
  colorCount = 4,
  availableSizes = ['STANDART'],
  hideSizes = false,
  rating = 5,
  reviewCount = 0,
  hasPhotoReview = true,
  priceColor = '#16a34a',
  onAddToCart,
  onToggleFavorite,
}) => {
  const router = useRouter();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  const activeFavorite = checkIsFavorite(id);
  const [isHovered, setIsHovered] = useState(false);

  // Fiyatı tam referans görseldeki formatta göster (örn: 319,99 TL - Yeşil renkte)
  const formattedPrice = price
    ? `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`
    : (priceFormatted ? priceFormatted.replace('₺', 'TL').trim() : '319,99 TL');

  const productUrl = slug.startsWith('/') ? slug : `/urun/${slug}`;

  const handleCardClick = (e: React.MouseEvent) => {
    // Tıklanan eleman bir buton veya link ise müdahale etme
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    router.push(productUrl);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: String(id),
      name: title,
      priceFormatted: formattedPrice,
      price,
      imageUrl,
      category: categoryName,
      slug: productUrl,
    });
    if (onToggleFavorite) onToggleFavorite(id);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        boxShadow: isHovered ? '0 8px 20px rgba(0, 0, 0, 0.06)' : '0 1px 3px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.25s ease',
        position: 'relative',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. GÖRSEL VE OVERLAY ROZETLER (Aspect Ratio: 3/4) */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '133%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
        <Link href={productUrl} style={{ position: 'absolute', inset: 0, display: 'block' }}>
          <img
            src={imageUrl || '/images/default.jpg'}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              transform: isHovered ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.35s ease',
            }}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </Link>

        {/* Sağ Üst: Dairesel Beyaz Favori Butonu (Referans Görsel: Beyaz Daire & İnce Gri Kalp) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: 'none',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 3,
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          aria-label="Favorilere Ekle"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={activeFavorite ? '#ff6000' : 'none'}
            stroke={activeFavorite ? '#ff6000' : '#475569'}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Sol Alt: 'ÇOK SATANLAR' veya '▶ VİDEO' Rozeti */}
        {badgeText ? (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: badgeColor,
              color: '#ffffff',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              zIndex: 2,
              pointerEvents: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            <span>{badgeText}</span>
          </div>
        ) : hasVideo ? (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              color: '#ffffff',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#ffffff">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>VİDEO</span>
          </div>
        ) : null}

        {/* Sağ Alt: Renk Varyant Sayısı Hap Rozeti (⚪🔵 4) */}
        {colorCount > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              padding: '2px 7px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 2,
              pointerEvents: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', display: 'inline-block' }} />
            <span>{colorCount}</span>
          </div>
        )}

        {/* Alt Orta: Slider Sayfalama Noktaları (6 Nokta - Referans Görselle Birebir) */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.6)' }} />
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.6)' }} />
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.6)' }} />
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.6)' }} />
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.6)' }} />
        </div>
      </div>

      {/* 2. ÜRÜN BİLGİ ALANI */}
      <div style={{ padding: '12px 10px 14px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
        {/* Kategori Etiketi */}
        {categoryName && (
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', textTransform: 'capitalize' }}>
            {categoryName}
          </div>
        )}

        {/* Ürün Başlığı (2 Satır Sabit Yükseklik) */}
        <Link
          href={productUrl}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#1e293b',
            textDecoration: 'none',
            lineHeight: 1.35,
            minHeight: '35px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={title}
        >
          {title}
        </Link>

        {/* Yıldız Değerlendirme & Fotoğraflı Yorum İkonu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
          {/* 5 Sarı Yıldız */}
          <div style={{ display: 'flex', gap: '1px', color: '#f59e0b' }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>

          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>
            ({reviewCount})
          </span>

          {hasPhotoReview && (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginLeft: '2px' }}
              title="Fotoğraflı Değerlendirmeler"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
        </div>

        {/* Beden Butonları (Referans: S | M | L Buton Kutuları) */}
        {!hideSizes && availableSizes && availableSizes.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
            {availableSizes.map((sz) => (
              <span
                key={sz}
                style={{
                  minWidth: '24px',
                  height: '22px',
                  border: '1px solid #d1d5db',
                  borderRadius: '3px',
                  backgroundColor: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxSizing: 'border-box',
                }}
              >
                {sz}
              </span>
            ))}
          </div>
        )}

        {/* Fiyat Satırı: Referans Görseldeki Renk (Varsayılan Yeşil 319,99 TL veya Özelleştirilebilir) */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
          <span style={{ fontSize: '16.5px', fontWeight: 800, color: priceColor }}>
            {formattedPrice}
          </span>
          {compareAtPriceFormatted && (
            <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
              {compareAtPriceFormatted.replace('₺', 'TL')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
