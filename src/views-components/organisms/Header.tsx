'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FKButikLogo } from '../atoms/FKButikLogo';
import { SeoLink } from '../primitives/SeoLink';
import { SlideCart } from './SlideCart';
import { FullScreenSearchModal } from '../molecules/FullScreenSearchModal';
import { useCart } from '@/src/core/cart/use-cart';
import { useFavorites } from '@/src/core/favorites/use-favorites';
import { useAuth } from '@/src/core/auth/auth-store';

export interface HeaderProps {
  cartCount?: number;
  favoriteCount?: number;
  initialCategories?: any[];
  onOpenCart?: () => void;
  onSearch?: (query: string) => void;
}

interface CategoryMenuItem {
  id: string;
  title: string;
  slug: string;
  isStar?: boolean;
  subcategories?: Array<{ name: string; slug: string }>;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount: propCartCount,
  favoriteCount: propFavoriteCount,
  initialCategories,
  onOpenCart,
  onSearch,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const isProductDetail = Boolean(pathname?.startsWith('/urun/'));
  const isAuthPage = Boolean(pathname === '/hesap/giris' || pathname === '/hesap/kayit');
  const isProfilePage = Boolean(pathname?.startsWith('/hesap'));
  const isCheckoutFunnelPage = Boolean(
    pathname === '/odeme' ||
    pathname?.startsWith('/siparis')
  );

  const { cartCount: liveCartCount } = useCart();
  const { favoriteCount: liveFavoriteCount } = useFavorites();
  const { user, isAuthenticated } = useAuth();
  const effectiveCartCount = propCartCount !== undefined ? propCartCount : liveCartCount;
  const effectiveFavoriteCount = propFavoriteCount !== undefined ? propFavoriteCount : liveFavoriteCount;
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);

  // Canlı Veritabanı Kategorileri
  const [liveCategories, setLiveCategories] = useState<any[]>(initialCategories || []);

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

  // Mobil akordeon açık/kapalı takibi
  const [openMobileAccordions, setOpenMobileAccordions] = useState<Record<string, boolean>>({
    'ust-giyim': true,
    'alt-giyim': false,
    'elbise': false,
    'aksesuar': false,
  });

  // Mobil Drawer açıkken arka plan kaydırmasını kilitle
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileAccordion = (key: string) => {
    setOpenMobileAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCartClick = () => {
    router.push('/sepet');
  };

  if (isCheckoutFunnelPage) {
    return (
      <header className="fk-main-header" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="fk-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px 16px', width: '100%', position: 'relative' }}>
          {/* Mobil Geri Dön Butonu */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/koleksiyon/tum-urunler');
              }
            }}
            className="fk-mobile-only"
            style={{
              position: 'absolute',
              left: '14px',
              background: 'none',
              border: 'none',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              cursor: 'pointer',
            }}
            aria-label="Geri Dön"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <SeoLink href="/" className="fk-logo-link" aria-label="FK Butik Ana Sayfa" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FKButikLogo width={168} height={42} className="fk-header-logo" />
          </SeoLink>

          {/* Sağ Kol: Arama Butonu + Güvenli Alışveriş Rozeti (Masaüstü) */}
          <div style={{ position: 'absolute', right: '20px', display: 'flex', alignItems: 'center', gap: '16px' }} className="fk-desktop-only">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '9999px',
                fontSize: '13px',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              aria-label="Arama Yap"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff6000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Ürün ara...</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '12px', fontWeight: 700 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>256-Bit SSL Güvenli</span>
            </div>
          </div>

          {/* Sağ Kol: Arama İkonu + Güvenli Kilit İkonu (Mobil) */}
          <div className="fk-mobile-only" style={{ position: 'absolute', right: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                cursor: 'pointer',
              }}
              aria-label="Arama Yap"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', color: '#16a34a' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Checkout esnasında da arama yapılabilmesi için FullScreenSearchModal */}
        <FullScreenSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          initialQuery={searchQuery}
        />
      </header>
    );
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      window.location.href = `/koleksiyon/yeni-gelenler?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Yedek Navigasyon (API henüz yanıt vermediyse veya SSR esnasında)
  const defaultNavigationItems: CategoryMenuItem[] = [
    {
      id: '1',
      title: 'YENİ ÜRÜNLER',
      slug: '/koleksiyon/yeni-urunler',
      isStar: false,
    },
    {
      id: '2',
      title: 'ELBİSE',
      slug: '/koleksiyon/elbise',
      subcategories: [
        { name: 'Günlük Elbise', slug: '/koleksiyon/gunluk-elbise' },
        { name: 'Triko Elbise', slug: '/koleksiyon/triko-elbise' },
        { name: 'Şık & Abiye Elbise', slug: '/koleksiyon/sik-abiye-elbise' },
        { name: 'İkili Takımlar', slug: '/koleksiyon/ikili-takimlar' },
      ],
    },
    {
      id: '3',
      title: 'ÜST GİYİM',
      slug: '/koleksiyon/ust-giyim',
      subcategories: [
        { name: 'Bluz', slug: '/koleksiyon/bluz' },
        { name: 'Takım', slug: '/koleksiyon/takim' },
        { name: 'Ceket / Mont', slug: '/koleksiyon/ceket-mont' },
        { name: 'Gömlek', slug: '/koleksiyon/gomlek' },
        { name: 'Triko', slug: '/koleksiyon/triko' },
        { name: 'Hırka', slug: '/koleksiyon/hirka' },
        { name: 'Yelek', slug: '/koleksiyon/yelek' },
        { name: 'Atlet', slug: '/koleksiyon/atlet' },
      ],
    },
    {
      id: '4',
      title: 'ALT GİYİM',
      slug: '/koleksiyon/alt-giyim',
      subcategories: [
        { name: 'Pantolon', slug: '/koleksiyon/pantolon' },
        { name: 'Etek', slug: '/koleksiyon/etek' },
        { name: 'Şort', slug: '/koleksiyon/sort' },
        { name: 'Eşofman Altı', slug: '/koleksiyon/esofman-alti' },
      ],
    },
    {
      id: '5',
      title: 'AKSESUAR',
      slug: '/koleksiyon/aksesuar',
      subcategories: [
        { name: 'Vip Tasarım Premium Kolye', slug: '/koleksiyon/vip-tasarim-premium-kolye' },
        { name: 'Kolye', slug: '/koleksiyon/kolye' },
        { name: 'Çanta', slug: '/koleksiyon/canta' },
        { name: 'Bileklik', slug: '/koleksiyon/bileklik' },
        { name: 'Şal / Fular', slug: '/koleksiyon/sal-fular' },
      ],
    },
    {
      id: '6',
      title: 'ÇOK SATANLAR',
      slug: '/koleksiyon/cok-satanlar',
    },
  ];

  // Veritabanından dinamik gelen kategorileri menü formatına dönüştür
  const navigationItems: CategoryMenuItem[] = liveCategories.length > 0
    ? liveCategories.map((root: any) => ({
        id: String(root.id),
        title: root.name,
        slug: `/koleksiyon/${root.slug}`,
        isStar: false,
        subcategories: (root.children || []).map((sub: any) => ({
          name: sub.name,
          slug: `/koleksiyon/${sub.slug}`,
        })),
      }))
    : defaultNavigationItems;

  return (
    <header className={`fk-site-header ${isProductDetail ? 'fk-header-pdp-mode' : ''} ${isAuthPage ? 'fk-header-auth-mode' : ''}`}>
      {/* 1. KADEME: TOP ANNOUNCEMENT BAR */}
      <div className="fk-top-bar">
        <div className="fk-container fk-top-bar-content">
          <div className="fk-top-announcement">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff6000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '6px', verticalAlign: 'middle' }}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>500 TL Üzeri Ücretsiz Kargo | Saat 16:00'ya Kadar Aynı Gün Sevk</span>
          </div>
          <div className="fk-top-contact-links">
            <a href="tel:08502590449" className="fk-contact-item">
              <span className="fk-contact-label">Çağrı Merkezi:</span>
              <strong className="fk-contact-value">0850 259 0 449</strong>
            </a>
            <span className="fk-divider">|</span>
            <a href="https://wa.me/905327805100" target="_blank" rel="noopener noreferrer" className="fk-contact-item fk-whatsapp">
              <span className="fk-contact-label">WhatsApp:</span>
              <strong className="fk-contact-value">0532 780 51 00</strong>
            </a>
          </div>
        </div>
      </div>

      {/* 2. KADEME: MAIN HEADER (Logo, Search Bar, Desktop Actions) */}
      <div className="fk-main-header">
        <div className="fk-container fk-main-header-content">
          {/* SADECE MOBİL ÜRÜN DETAYI MODU (Referans Görsel: [<] [🔍 Ürün, kate...] [👤] [♡] [🛒]) */}
          {isProductDetail && (
            <div className="fk-mobile-pdp-header-bar">
              {/* 1. Geri Dön Butonu */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push('/koleksiyon/tum-urunler');
                  }
                }}
                className="fk-pdp-back-btn"
                aria-label="Geri Dön"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* 2. Oval Arama Çubuğu (Referans Görsel: [🔍 Ürün, kate...]) */}
              <div
                className="fk-pdp-search-pill"
                onClick={() => setIsSearchModalOpen(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="fk-pdp-search-placeholder">Ürün, kate...</span>
              </div>

              {/* 3. Sağ Aksiyon Butonları: Profil, Favoriler, Sepet */}
              <div className="fk-pdp-actions">
                <Link
                  href={isAuthenticated ? '/hesap' : '/hesap/giris'}
                  className="fk-pdp-action-btn"
                  aria-label="Hesabım"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>

                <Link
                  href="/hesap/favorilerim"
                  className="fk-pdp-action-btn"
                  aria-label="Favorilerim"
                >
                  <div className="fk-pdp-badge-wrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {effectiveFavoriteCount > 0 && (
                      <span className="fk-badge fk-badge-pdp">{effectiveFavoriteCount}</span>
                    )}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleCartClick}
                  className="fk-pdp-action-btn"
                  aria-label="Sepetim"
                >
                  <div className="fk-pdp-badge-wrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    {effectiveCartCount > 0 && (
                      <span className="fk-badge fk-badge-orange fk-badge-pdp">{effectiveCartCount}</span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* 1. Sol Kolon: Logo Alanı (Kurumsal Standart: Sol Tarafta) */}
          <div className="fk-logo-area">
            <SeoLink href="/" className="fk-logo-link" aria-label="FK Butik Ana Sayfa">
              <FKButikLogo width={180} height={42} className="fk-header-logo" />
            </SeoLink>
          </div>

          {/* 2. Orta Kolon: Masaüstü ve Mobil Arama Çubuğu */}
          <div className="fk-search-area">
            <form onSubmit={handleSearchSubmit} className="fk-search-form" onClick={() => setIsSearchModalOpen(true)}>
              <input
                type="text"
                placeholder="Ürün veya koleksiyon ara..."
                value={searchQuery}
                onFocus={() => setIsSearchModalOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="fk-search-input"
                readOnly
              />
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="fk-search-btn"
                aria-label="Arama modalını aç"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>
          </div>

          {/* 3. Sağ Kolon: Masaüstü Kullanıcı Butonları */}
          <div className="fk-user-actions fk-user-actions-desktop">
            {isAuthenticated && user ? (
              <SeoLink href="/hesap" className="fk-action-btn" title={user.full_name}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>{user.full_name ? user.full_name.split(' ')[0] : 'Hesabım'}</span>
              </SeoLink>
            ) : (
              <SeoLink href="/hesap/giris" className="fk-action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Giriş Yap</span>
              </SeoLink>
            )}

            <SeoLink href="/hesap/favorilerim" className="fk-action-btn fk-action-fav">
              <div className="fk-icon-badge-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {effectiveFavoriteCount > 0 && <span className="fk-badge">{effectiveFavoriteCount}</span>}
              </div>
              <span>Favorilerim</span>
            </SeoLink>

            <button type="button" onClick={handleCartClick} className="fk-action-btn fk-action-cart" aria-label="Sepeti Görüntüle">
              <div className="fk-icon-badge-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {effectiveCartCount > 0 && <span className="fk-badge fk-badge-orange">{effectiveCartCount}</span>}
              </div>
              <span>Sepetim</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. KADEME: MASAÜSTÜ KATEGORİ NAVİGASYON BARI (Veritabanıyla Canlı Senkronize) */}
      <div className="fk-desktop-category-bar">
        <div className="fk-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <nav className="fk-ref-nav-list">
            {navigationItems.map((item) => {
              const hasSubs = item.subcategories && item.subcategories.length > 0;
              const isHovered = hoveredMenuId === item.id;

              return (
                <div
                  key={item.id}
                  className="fk-ref-nav-item"
                  onMouseEnter={() => setHoveredMenuId(item.id)}
                  onMouseLeave={() => setHoveredMenuId(null)}
                >
                  <Link
                    href={item.slug}
                    className={`fk-ref-nav-link ${isHovered ? 'active' : ''}`}
                  >
                    <span>{item.title}</span>
                  </Link>

                  {/* Referans Görseldeki Beyaz Kart Açılır Menü */}
                  {hasSubs && isHovered && (
                    <div className="fk-ref-dropdown-card">
                      {item.subcategories!.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={sub.slug}
                          className="fk-ref-dropdown-row"
                          onClick={() => setHoveredMenuId(null)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* MOBİL İÇİN TAM GENİŞLİKTE "KATEGORİLERE GÖZAT" BUTONU */}
      <div className="fk-mobile-browse-bar">
        <div className="fk-container">
          <button
            type="button"
            className="fk-mobile-browse-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Kategorilere Gözat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span>KATEGORİLERE GÖZAT</span>
          </button>
        </div>
      </div>

      {/* MOBİL DRAWER OVERLAY */}
      <div
        className={`fk-drawer-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* MOBİL DRAWER (Canlı Kategori Ağacı Hiyerarşisi - TAM EKRAN) */}
      <aside className={`fk-mobile-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="fk-drawer-header">
          <div className="fk-drawer-logo-wrap">
            <FKButikLogo width={136} height={34} />
          </div>
          <button
            type="button"
            className="fk-drawer-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Kapat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="fk-drawer-body">
          {isAuthenticated && user ? (
            <div style={{ padding: '14px 16px', backgroundColor: '#fff7ed', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #ffedd5' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{user.full_name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
              </div>
              <Link href="/hesap" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '13px', fontWeight: 700, color: '#ff6000', textDecoration: 'none' }}>
                Hesabım →
              </Link>
            </div>
          ) : (
            <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Hesabınıza giriş yapın</span>
              <Link href="/hesap/giris" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '13px', fontWeight: 700, color: '#ff6000', textDecoration: 'none' }}>
                Giriş Yap →
              </Link>
            </div>
          )}

          <div className="fk-drawer-section-title">KATEGORİLER</div>

          {navigationItems.map((item) => {
            const hasSubs = item.subcategories && item.subcategories.length > 0;
            const isOpen = Boolean(openMobileAccordions[item.id]);

            if (!hasSubs) {
              return (
                <Link
                  key={item.id}
                  href={item.slug}
                  className="fk-drawer-direct-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{item.title}</span>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>→</span>
                </Link>
              );
            }

            return (
              <div key={item.id} className="fk-drawer-accordion-wrap">
                <button
                  type="button"
                  className="fk-drawer-accordion-btn"
                  onClick={() => toggleMobileAccordion(item.id)}
                >
                  <span style={{ fontWeight: 800 }}>{item.title}</span>
                  <span
                    style={{
                      transform: isOpen ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      display: 'inline-block',
                      fontSize: '12px',
                    }}
                  >
                    ▶
                  </span>
                </button>

                {isOpen && (
                  <div className="fk-drawer-accordion-content">
                    <Link
                      href={item.slug}
                      className="fk-drawer-sub-link"
                      style={{ fontWeight: 700, color: '#ff6000' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>Tüm {item.title} Ürünleri</span>
                      <span style={{ color: '#ff6000', fontSize: '12px' }}>→</span>
                    </Link>
                    {item.subcategories!.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={sub.slug}
                        className="fk-drawer-sub-link"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>{sub.name}</span>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* TAM EKRAN ARAMA MODALI */}
      <FullScreenSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        initialQuery={searchQuery}
      />

      {/* SLIDE SEPET ÇEKMECESİ */}
      <SlideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};
