'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/src/core/cart/use-cart';
import { useFavorites } from '@/src/core/favorites/use-favorites';
import { useAuth } from '@/src/core/auth/auth-store';

export interface MobileBottomNavProps {
  cartCount?: number;
  favoriteCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount: propCartCount,
  favoriteCount: propFavoriteCount,
}) => {
  const pathname = usePathname();

  // Ürün detay, sepet ve sipariş tamamlama sayfalarında alt genel menü gizlenir (kendi özel sticky aksiyon barları yerleşir)
  if (
    pathname &&
    (pathname.startsWith('/urun/') ||
      pathname.startsWith('/sepet') ||
      pathname.startsWith('/siparis') ||
      pathname.startsWith('/odeme'))
  ) {
    return null;
  }

  const { cartCount: liveCartCount } = useCart();
  const { favoriteCount: liveFavoriteCount } = useFavorites();
  const { user, isAuthenticated } = useAuth();

  const effectiveCartCount = propCartCount !== undefined ? propCartCount : liveCartCount;
  const effectiveFavoriteCount = propFavoriteCount !== undefined ? propFavoriteCount : liveFavoriteCount;

  const isHome = pathname === '/';
  const isCollections = pathname.startsWith('/koleksiyon');
  const isFavorites = pathname.startsWith('/hesap/favorilerim');
  const isCart = pathname.startsWith('/sepet');
  const isAccount = pathname.startsWith('/hesap') && !isFavorites;

  return (
    <nav className="fk-mobile-bottom-nav" aria-label="Mobil Alt Menü">
      {/* 1. Ana Sayfa */}
      <Link
        href="/"
        className={`fk-bottom-nav-item ${isHome ? 'active' : ''}`}
        aria-label="Ana Sayfa"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Ana Sayfa</span>
      </Link>

      {/* 2. Kategoriler */}
      <Link
        href="/koleksiyon/yeni-gelenler"
        className={`fk-bottom-nav-item ${isCollections ? 'active' : ''}`}
        aria-label="Kategoriler"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
        <span>Kategoriler</span>
      </Link>

      {/* 3. Favorilerim */}
      <Link
        href="/hesap/favorilerim"
        className={`fk-bottom-nav-item ${isFavorites ? 'active' : ''}`}
        aria-label="Favorilerim"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {effectiveFavoriteCount > 0 && <span className="fk-bottom-nav-badge">{effectiveFavoriteCount}</span>}
        <span>Favoriler</span>
      </Link>

      {/* 4. Sepetim */}
      <Link
        href="/sepet"
        className={`fk-bottom-nav-item ${isCart ? 'active' : ''}`}
        aria-label="Sepetim"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {effectiveCartCount > 0 && <span className="fk-bottom-nav-badge">{effectiveCartCount}</span>}
        <span>Sepetim</span>
      </Link>

      {/* 5. Hesabım */}
      <Link
        href={isAuthenticated ? '/hesap' : '/hesap/giris'}
        className={`fk-bottom-nav-item ${isAccount ? 'active' : ''}`}
        aria-label="Hesabım"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{isAuthenticated && user ? user.full_name.split(' ')[0] : 'Hesabım'}</span>
      </Link>
    </nav>
  );
};

