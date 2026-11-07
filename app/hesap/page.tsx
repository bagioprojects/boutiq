'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AccountLayout } from '@/src/views-components/account/AccountLayout';
import { useAuth } from '@/src/core/auth/auth-store';
import { useFavorites } from '@/src/core/favorites/use-favorites';
import {
  Package,
  MapPin,
  Heart,
  User,
  Shield,
  Ticket,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  Phone,
  MessageCircle,
  Mail,
} from 'lucide-react';

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const { favoriteCount } = useFavorites();
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/user/orders').then((r) => r.json()).catch(() => ({ orders: [] })),
      fetch('/api/user/addresses').then((r) => r.json()).catch(() => ({ addresses: [] })),
      fetch('/api/user/coupons').then((r) => r.json()).catch(() => ({ coupons: [] })),
    ]).then(([orderRes, addrRes, couponRes]) => {
      if (orderRes.success && Array.isArray(orderRes.orders)) setOrders(orderRes.orders);
      if (addrRes.success && Array.isArray(addrRes.addresses)) setAddresses(addrRes.addresses);
      if (couponRes.success && Array.isArray(couponRes.coupons)) setCoupons(couponRes.coupons);
      setLoadingStats(false);
    });
  }, []);

  const userName = user?.full_name || 'Değerli Müşterimiz';

  const statCards = [
    {
      title: 'Toplam Siparişim',
      value: loadingStats ? '...' : orders.length.toString(),
      icon: Package,
      href: '/hesap/siparislerim',
      color: '#3b82f6',
      bg: '#eff6ff',
      desc: 'Tüm sipariş detayları',
    },
    {
      title: 'Kayıtlı Adresim',
      value: loadingStats ? '...' : addresses.length.toString(),
      icon: MapPin,
      href: '/hesap/adreslerim',
      color: '#ff6000',
      bg: '#fff7ed',
      desc: 'Teslimat & fatura adresleri',
    },
    {
      title: 'Favorilerim',
      value: favoriteCount.toString(),
      icon: Heart,
      href: '/hesap/favorilerim',
      color: '#ec4899',
      bg: '#fdf2f8',
      desc: 'Beğendiğiniz ürünler',
    },
    {
      title: 'Aktif Kuponlarım',
      value: loadingStats ? '...' : coupons.length.toString(),
      icon: Ticket,
      href: '/hesap/kuponlarim',
      color: '#10b981',
      bg: '#ecfdf5',
      desc: 'Özel indirim fırsatları',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Hazırlanıyor':
        return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa', icon: Clock };
      case 'Kargoya Verildi':
        return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', icon: Truck };
      case 'Teslim Edildi':
        return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', icon: CheckCircle };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', icon: Clock };
    }
  };

  return (
    <AccountLayout
      title="Hesap Özeti"
      subtitle={`Hoş geldiniz, ${userName}! Profil bilgilerinizi, siparişlerinizi ve adreslerinizi buradan yönetebilirsiniz.`}
    >
      <div className="fk-desktop-only" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* İstatistik Kartları Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: card.bg,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <ChevronRight size={16} style={{ color: '#cbd5e1' }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                    {card.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Son Siparişler Kartı */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Son Siparişlerim
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                En son verdiğiniz siparişlerin güncel teslimat durumu
              </p>
            </div>
            <Link
              href="/hesap/siparislerim"
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#ff6000',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Tümünü Gör ({orders.length})</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {loadingStats ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              Siparişler yükleniyor...
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
              }}
            >
              <Package size={36} style={{ color: '#94a3b8', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#334155', margin: '0 0 4px 0' }}>
                Henüz kayıtlı bir siparişiniz bulunmuyor
              </p>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 16px 0' }}>
                Yeni sezon koleksiyonlarımızı keşfedip hemen alışverişe başlayabilirsiniz.
              </p>
              <Link
                href="/koleksiyon/yeni-gelenler"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ff6000',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.slice(0, 3).map((order) => {
                const badge = getStatusBadge(order.status);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={order.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0f172a',
                        }}
                      >
                        <Package size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {order.order_number}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            <BadgeIcon size={12} />
                            <span>{order.status}</span>
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('tr-TR') : 'Bugün'} •{' '}
                          {order.items?.length || 1} Ürün
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                        {Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </span>
                      <Link
                        href={`/hesap/siparislerim?order=${order.order_number}`}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        Detay
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hızlı Destek ve İletişim Kartı */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              Yardıma mı ihtiyacınız var?
            </h4>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Siparişleriniz, kargo takibi ve iade süreçleri için müşteri temsilcimizle anında iletişime geçebilirsiniz.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/905327805100"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#22c55e',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <MessageCircle size={16} />
              <span>WhatsApp Destek</span>
            </a>

            <a
              href="tel:+905327805100"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid #cbd5e1',
              }}
            >
              <Phone size={16} />
              <span>0 (532) 780 51 00</span>
            </a>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
