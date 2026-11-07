'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '../organisms/Header';
import { Footer } from '../organisms/Footer';
import { useAuth } from '@/src/core/auth/auth-store';
import { useFavorites } from '@/src/core/favorites/use-favorites';
import {
  Package,
  MapPin,
  Heart,
  User,
  Shield,
  Ticket,
  LogOut,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface AccountLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { favoriteCount } = useFavorites();
  const [addressCount, setAddressCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/hesap/giris');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/user/addresses')
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.addresses)) {
            setAddressCount(d.addresses.length);
          }
        })
        .catch(() => {});

      fetch('/api/user/orders')
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.orders)) {
            setOrderCount(d.orders.length);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    if (confirm('Hesabınızdan çıkış yapmak istediğinize emin misiniz?')) {
      await logout();
      router.push('/hesap/giris');
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '15px' }}>
            Hesap bilgileri yükleniyor...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    {
      title: 'Hesap Özeti',
      href: '/hesap',
      icon: User,
      exact: true,
    },
    {
      title: 'Siparişlerim',
      href: '/hesap/siparislerim',
      icon: Package,
      badge: orderCount !== null && orderCount > 0 ? orderCount : undefined,
    },
    {
      title: 'Kayıtlı Adreslerim',
      href: '/hesap/adreslerim',
      icon: MapPin,
      badge: addressCount !== null && addressCount > 0 ? addressCount : undefined,
    },
    {
      title: 'Favorilerim',
      href: '/hesap/favorilerim',
      icon: Heart,
      badge: favoriteCount > 0 ? favoriteCount : undefined,
    },
    {
      title: 'Üyelik Bilgilerim',
      href: '/hesap/bilgilerim',
      icon: User,
    },
    {
      title: 'Güvenlik & Şifre',
      href: '/hesap/guvenlik',
      icon: Shield,
    },
    {
      title: 'İndirim Kuponlarım',
      href: '/hesap/kuponlarim',
      icon: Ticket,
      badgeHighlight: 'Aktif',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '24px 16px 60px' }}>
        {/* Üst Navigasyon Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Ana Sayfa</Link>
          <span>/</span>
          <Link href="/hesap" style={{ color: '#64748b', textDecoration: 'none' }}>Hesabım</Link>
          {pathname !== '/hesap' && (
            <>
              <span>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{title}</span>
            </>
          )}
        </div>

        {/* 2 Kolonlu Düzen: Sol Menü + Sağ İçerik */}
        <div className="fk-account-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 300px) 1fr', gap: '28px', alignItems: 'start' }}>
          {/* SOL PANEL: Profil Kartı ve Navigasyon (Mobilde alt sayfalarda gizlenir, ana hesap menüsünde gösterilir) */}
          <aside className={pathname !== '/hesap' ? 'fk-desktop-only' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Kullanıcı Rozet Kartı */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#fff7ed',
                  border: '2px solid #ffedd5',
                  color: '#ff6000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h2
                    style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.full_name}
                  </h2>
                  {user.role === 'admin' && (
                    <span
                      style={{
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                      }}
                    >
                      Admin
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '12.5px',
                    color: '#64748b',
                    margin: '3px 0 0 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </p>
                {user.phone && (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Menü Linkleri */}
            <nav
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      backgroundColor: isActive ? '#fff7ed' : 'transparent',
                      color: isActive ? '#ea580c' : '#334155',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '13.5px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <IconComponent
                        size={18}
                        style={{
                          color: isActive ? '#ff6000' : '#64748b',
                          flexShrink: 0,
                        }}
                      />
                      <span>{item.title}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.badge !== undefined && (
                        <span
                          style={{
                            backgroundColor: isActive ? '#ea580c' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#475569',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '1px 7px',
                            borderRadius: '10px',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.badgeHighlight && (
                        <span
                          style={{
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '6px',
                          }}
                        >
                          {item.badgeHighlight}
                        </span>
                      )}
                      <ChevronRight size={14} style={{ color: isActive ? '#ea580c' : '#cbd5e1' }} />
                    </div>
                  </Link>
                );
              })}

              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    marginTop: '4px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield size={18} style={{ color: '#0f172a' }} />
                    <span>Yönetici Paneli</span>
                  </div>
                  <ExternalLink size={14} style={{ color: '#64748b' }} />
                </Link>
              )}

              {/* Çıkış Yap Butonu */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '8px',
                  borderTop: '1px solid #f1f5f9',
                  transition: 'background-color 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
                <span>Güvenli Çıkış Yap</span>
              </button>
            </nav>
          </aside>

          {/* SAĞ PANEL: İçerik Alanı (Mobilde /hesap ana sayfasındayken özet bilgiler gizlenir, sadece menü gösterilir) */}
          <div className={`fk-account-content-pane ${pathname === '/hesap' ? 'fk-desktop-only' : ''}`} style={{ minWidth: 0 }}>
            {/* Sayfa Başlığı */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px 28px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                marginBottom: '20px',
              }}
            >
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: '6px 0 0 0' }}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Dinamik Sayfa Bileşeni */}
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

