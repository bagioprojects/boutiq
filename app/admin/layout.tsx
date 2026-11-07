'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin/login';
  const [isAuthChecking, setIsAuthChecking] = useState(!isLoginPage);
  const [adminUser, setAdminUser] = useState<any>(null);

  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    products: false,
    orders: false,
    payments: false,
    shop: false,
  });

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthChecking(false);
      return;
    }

    let isMounted = true;

    // Check fast local state
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fk_admin_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.role === 'admin') {
            setAdminUser(parsed);
          }
        } catch {}
      }
    }

    // Verify session from server
    fetch('/api/admin/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.authenticated && data.user?.role === 'admin') {
          setAdminUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('fk_admin_user', JSON.stringify(data.user));
          }
          setIsAuthChecking(false);
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('fk_admin_user');
          }
          router.push('/admin/login');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        router.push('/admin/login');
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  useEffect(() => {
    if (
      pathname.startsWith('/admin/products') ||
      pathname.startsWith('/admin/stock') ||
      pathname === '/admin/settings/variations' ||
      pathname === '/admin/settings/categories'
    ) {
      setOpenGroups((prev) => ({ ...prev, products: true }));
    } else if (pathname.startsWith('/admin/orders')) {
      setOpenGroups((prev) => ({ ...prev, orders: true }));
    } else if (pathname.startsWith('/admin/payments')) {
      setOpenGroups((prev) => ({ ...prev, payments: true }));
    } else if (pathname.startsWith('/admin/settings')) {
      setOpenGroups((prev) => ({ ...prev, shop: true }));
    }
  }, [pathname]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLinkActive = (path: string) => pathname === path;

  const handleAdminLogout = async () => {
    if (confirm('Yönetici oturumunu kapatmak istediğinize emin misiniz?')) {
      try {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
      } catch {}
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fk_admin_user');
      }
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return (
      <div className="shopier-body">
        <link rel="stylesheet" href="/admin/admin.css?v=4.0" />
        {children}
      </div>
    );
  }

  if (isAuthChecking) {
    return (
      <div
        className="shopier-body"
        style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <link rel="stylesheet" href="/admin/admin.css?v=4.0" />
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 96, 0, 0.2)',
              borderTopColor: '#ff6000',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>
            Yönetici Doğrulanıyor...
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="shopier-body">
      <link rel="stylesheet" href="/admin/admin.css?v=4.0" />
      <div className="shopier-layout">
        {/* SIDEBAR */}
        <aside className="shopier-sidebar">
          <div className="shopier-sidebar-brand">
            <Link href="/admin" className="admin-brand-wrap">
              <span className="brand-title">FK BUTİK</span>
              <span className="brand-tag">YÖNETİM</span>
            </Link>
          </div>

          <nav className="shopier-nav">
            {/* 1. Hesap Özeti */}
            <Link
              href="/admin"
              className={`shopier-nav-item ${isLinkActive('/admin') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              <span className="nav-label">Hesap Özeti</span>
            </Link>

            {/* 2. Ürün Yönetimi Accordion */}
            <div className={`shopier-nav-group ${openGroups.products ? 'active' : ''}`}>
              <div
                className="shopier-nav-item group-header"
                onClick={() => toggleGroup('products')}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                </span>
                <span className="nav-label">Ürün Yönetimi</span>
                <svg
                  className="nav-chevron group-chevron"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
              <div className="shopier-sub-nav">
                <Link
                  href="/admin/products"
                  className={`shopier-sub-item ${isLinkActive('/admin/products') ? 'active' : ''}`}
                >
                  Tüm Ürünler
                </Link>
                <Link
                  href="/admin/stock"
                  className={`shopier-sub-item ${isLinkActive('/admin/stock') ? 'active' : ''}`}
                >
                  Stok Yönetimi
                </Link>
                <Link
                  href="/admin/settings/variations"
                  className={`shopier-sub-item ${isLinkActive('/admin/settings/variations') ? 'active' : ''}`}
                >
                  Varyasyonlar
                </Link>
                <Link
                  href="/admin/settings/categories"
                  className={`shopier-sub-item ${isLinkActive('/admin/settings/categories') ? 'active' : ''}`}
                >
                  Kategoriler
                </Link>
              </div>
            </div>

            {/* 3. Siparişler Accordion */}
            <div className={`shopier-nav-group ${openGroups.orders ? 'active' : ''}`}>
              <div
                className="shopier-nav-item group-header"
                onClick={() => toggleGroup('orders')}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </span>
                <span className="nav-label">Siparişler</span>
                <span className="nav-badge">5</span>
                <svg
                  className="nav-chevron group-chevron"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
              <div className="shopier-sub-nav">
                <Link
                  href="/admin/orders"
                  className={`shopier-sub-item ${isLinkActive('/admin/orders') ? 'active' : ''}`}
                >
                  Tüm Siparişler
                </Link>
                <Link
                  href="/admin/orders/pending"
                  className={`shopier-sub-item ${isLinkActive('/admin/orders/pending') ? 'active' : ''}`}
                >
                  Hazırlanan Siparişler
                </Link>
                <Link
                  href="/admin/orders/shipped"
                  className={`shopier-sub-item ${isLinkActive('/admin/orders/shipped') ? 'active' : ''}`}
                >
                  Kargoya Verilenler
                </Link>
                <Link
                  href="/admin/orders/returns"
                  className={`shopier-sub-item ${isLinkActive('/admin/orders/returns') ? 'active' : ''}`}
                >
                  İptal ve İade Talepleri
                </Link>
              </div>
            </div>

            {/* 4. Tahsilatlar & Finans Accordion */}
            <div className={`shopier-nav-group ${openGroups.payments ? 'active' : ''}`}>
              <div
                className="shopier-nav-item group-header"
                onClick={() => toggleGroup('payments')}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </span>
                <span className="nav-label">Tahsilatlar & Finans</span>
                <svg
                  className="nav-chevron group-chevron"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
              <div className="shopier-sub-nav">
                <Link
                  href="/admin/payments"
                  className={`shopier-sub-item ${isLinkActive('/admin/payments') ? 'active' : ''}`}
                >
                  Tahsilat Dökümü
                </Link>
                <Link
                  href="/admin/payments/payouts"
                  className={`shopier-sub-item ${isLinkActive('/admin/payments/payouts') ? 'active' : ''}`}
                >
                  Banka Aktarımları (Payouts)
                </Link>
                <Link
                  href="/admin/payments/pending"
                  className={`shopier-sub-item ${isLinkActive('/admin/payments/pending') ? 'active' : ''}`}
                >
                  Bekleyen Ödemeler
                </Link>
              </div>
            </div>

            {/* 5. Kupon Yönetimi */}
            <Link
              href="/admin/discounts"
              className={`shopier-nav-item ${isLinkActive('/admin/discounts') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="5" x2="5" y2="19"></line>
                  <circle cx="6.5" cy="6.5" r="2.5"></circle>
                  <circle cx="17.5" cy="17.5" r="2.5"></circle>
                </svg>
              </span>
              <span className="nav-label">Kupon Yönetimi</span>
            </Link>

            {/* 6. Dükkan Yönetimi Accordion */}
            <div className={`shopier-nav-group ${openGroups.shop ? 'active' : ''}`}>
              <div
                className="shopier-nav-item group-header"
                onClick={() => toggleGroup('shop')}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </span>
                <span className="nav-label">Dükkan Yönetimi</span>
                <svg
                  className="nav-chevron group-chevron"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
              <div className="shopier-sub-nav">
                <Link
                  href="/admin/settings/shop"
                  className={`shopier-sub-item ${isLinkActive('/admin/settings/shop') ? 'active' : ''}`}
                >
                  Mağaza Seçenekleri
                </Link>
                <Link
                  href="/admin/settings/banners"
                  className={`shopier-sub-item ${isLinkActive('/admin/settings/banners') ? 'active' : ''}`}
                >
                  Logo & Banner CMS
                </Link>
                <Link
                  href="/admin/settings/categories"
                  className={`shopier-sub-item ${isLinkActive('/admin/settings/categories') ? 'active' : ''}`}
                >
                  Kategoriler
                </Link>
                <Link
                  href="/admin/settings/tags"
                  className={`shopier-sub-item ${isLinkActive('/admin/settings/tags') ? 'active' : ''}`}
                >
                  Koleksiyon Sayfaları
                </Link>
                <Link
                  href="/admin/settings/shipping"
                  className={`shopier-sub-item ${isLinkActive('/admin/settings/shipping') ? 'active' : ''}`}
                >
                  Kargo Ayarları
                </Link>
              </div>
            </div>

            {/* 7. Entegrasyonlar */}
            <Link
              href="/admin/integrations"
              className={`shopier-nav-item ${isLinkActive('/admin/integrations') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </span>
              <span className="nav-label">Entegrasyonlar</span>
            </Link>

            {/* 8. Hesap & Güvenlik */}
            <Link
              href="/admin/account"
              className={`shopier-nav-item ${isLinkActive('/admin/account') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <span className="nav-label">Hesap & Güvenlik</span>
            </Link>
          </nav>

          <div className="shopier-sidebar-foot">
            <span className="sync-dot"></span>
            <span>Canlı Veritabanı Aktif</span>
          </div>
        </aside>

        {/* MAIN CONTAINER */}
        <div className="shopier-main-container">
          <header className="shopier-header">
            <div className="header-left">
              <div className="shopier-search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Sipariş no, ürün adı veya müşteri ara..."
                  id="adminGlobalSearch"
                />
              </div>
            </div>
            <div className="header-right">
              <a href="/" target="_blank" className="btn-shopier-outline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span>Dükkanı Gör</span>
              </a>
              <div className="admin-profile-pill">
                <div className="avatar">
                  {adminUser?.full_name ? adminUser.full_name.slice(0, 2).toUpperCase() : 'FK'}
                </div>
                <div className="profile-info">
                  <span className="profile-name">
                    {adminUser?.full_name || 'FK Butik'}
                  </span>
                  <span className="profile-role">Yönetici</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="btn-shopier-outline"
                style={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  padding: '0 12px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                }}
                title="Yönetici Oturumunu Kapat"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Çıkış Yap</span>
              </button>
            </div>
          </header>

          <main className="shopier-content-wrapper">{children}</main>
        </div>
      </div>
    </div>
  );
}

