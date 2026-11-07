'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AccountLayout } from '@/src/views-components/account/AccountLayout';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Calendar,
  CreditCard,
  MapPin,
  X
} from 'lucide-react';

interface OrderItem {
  product_id: number;
  product_name: string;
  sku?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image_url?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  total_amount: number;
  status: string;
  payment_method: string;
  cargo_company?: string;
  items: OrderItem[];
  created_at: string;
  tracking_code?: string;
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch('/api/user/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.orders)) {
          setOrders(d.orders);
          setFilteredOrders(d.orders);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o.status === filter));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Hazırlanıyor':
        return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa', icon: Clock, label: 'Hazırlanıyor' };
      case 'Kargoya Verildi':
        return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', icon: Truck, label: 'Kargoya Verildi' };
      case 'Teslim Edildi':
        return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', icon: CheckCircle, label: 'Teslim Edildi' };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', icon: Clock, label: status || 'İşleniyor' };
    }
  };

  return (
    <AccountLayout
      title="Siparişlerim"
      subtitle="Geçmiş ve aktif tüm siparişlerinizin durumunu, kargo takip bilgilerini ve fatura detaylarını inceleyin."
    >
      <div>
        {/* Filtreleme Tab Butonları */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '20px',
          }}
        >
          {[
            { id: 'all', label: 'Tüm Siparişler', count: orders.length },
            { id: 'Hazırlanıyor', label: 'Hazırlananlar', count: orders.filter((o) => o.status === 'Hazırlanıyor').length },
            { id: 'Kargoya Verildi', label: 'Kargodakiler', count: orders.filter((o) => o.status === 'Kargoya Verildi').length },
            { id: 'Teslim Edildi', label: 'Teslim Edilenler', count: orders.filter((o) => o.status === 'Teslim Edildi').length },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterChange(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: `1.5px solid ${isActive ? '#ff6000' : '#e2e8f0'}`,
                  backgroundColor: isActive ? '#fff7ed' : '#ffffff',
                  color: isActive ? '#ff6000' : '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? '#ff6000' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sipariş Listesi */}
        {loading ? (
          <div style={{ padding: '50px 0', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Siparişleriniz yükleniyor...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <Package size={44} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              {activeFilter === 'all' ? 'Henüz Bir Siparişiniz Bulunmuyor' : 'Bu Kriterde Sipariş Bulunamadı'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', maxWidth: '420px', marginInline: 'auto' }}>
              Kadın giyim koleksiyonlarımızın en trend parçalarını hemen keşfedin ve siparişinizi oluşturun.
            </p>
            <Link
              href="/koleksiyon/yeni-gelenler"
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
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              const BadgeIcon = badge.icon;
              const dateFormatted = order.created_at
                ? new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Bugün';

              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Kart Üst Bilgi Barı */}
                  <div
                    style={{
                      padding: '16px 20px',
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SİPARİŞ NUMARASI</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{order.order_number}</div>
                      </div>

                      <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }} className="fk-desktop-only" />

                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SİPARİŞ TARİHİ</div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#334155' }}>{dateFormatted}</div>
                      </div>

                      <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }} className="fk-desktop-only" />

                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ÖDEME YÖNTEMİ</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{order.payment_method || 'Kredi Kartı'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 800,
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        <BadgeIcon size={14} />
                        <span>{badge.label}</span>
                      </span>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TOPLAM TUTAR</div>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#ff6000' }}>
                          {Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ürünler Listesi */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '14px',
                            borderBottom: idx < order.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                            paddingBottom: idx < order.items.length - 1 ? '14px' : '0',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <img
                              src={item.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80'}
                              alt={item.product_name}
                              style={{
                                width: '56px',
                                height: '70px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                backgroundColor: '#f1f5f9',
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                                {item.product_name}
                              </h4>
                              <div style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: '#64748b' }}>
                                {item.size && <span>Beden: <strong style={{ color: '#0f172a' }}>{item.size}</strong></span>}
                                {item.color && <span>Renk: <strong style={{ color: '#0f172a' }}>{item.color}</strong></span>}
                                <span>Adet: <strong style={{ color: '#0f172a' }}>{item.quantity}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                              {(Number(item.price) * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                              Birim: {Number(item.price).toLocaleString('tr-TR')} ₺
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Kargo Takip Barı (Eğer Kargo Kodu Varsa) */}
                    {order.tracking_code && (
                      <div
                        style={{
                          marginTop: '16px',
                          padding: '12px 16px',
                          backgroundColor: '#eff6ff',
                          borderRadius: '8px',
                          border: '1px solid #bfdbfe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontSize: '13px', fontWeight: 600 }}>
                          <Truck size={18} />
                          <span>Kargo Takip No: <strong style={{ color: '#0f172a' }}>{order.tracking_code}</strong></span>
                        </div>
                        <a
                          href={`https://yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${order.tracking_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#2563eb',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>Kargom Nerede?</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    )}

                    {/* Aksiyon Butonları */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Sipariş Detaylarını Gör
                      </button>

                      <a
                        href={`https://wa.me/905327805100?text=${encodeURIComponent(`Merhaba, ${order.order_number} nolu siparişim hakkında bilgi almak istiyorum.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#22c55e',
                          color: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'none',
                        }}
                      >
                        Sipariş Desteği
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL: Sipariş Detayı */}
        {selectedOrder && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setSelectedOrder(null)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '28px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Sipariş Özeti: {selectedOrder.order_number}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Teslimat ve sipariş bilgileri dökümü
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Bilgi Kutusu Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TESLİMAT ALICISI</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {selectedOrder.customer_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedOrder.customer_phone}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TESLİMAT BÖLGESİ</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {selectedOrder.customer_city}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Türkiye</div>
                </div>
              </div>

              {/* Ürünler */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                  Sipariş Edilen Ürünler
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80'}
                          alt={item.product_name}
                          style={{ width: '42px', height: '52px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.product_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {item.size ? `Beden: ${item.size} • ` : ''}Adet: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#ff6000' }}>
                        {(Number(item.price) * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tutar Dökümü */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Ödenen Toplam:</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#ff6000' }}>
                  {Number(selectedOrder.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}

