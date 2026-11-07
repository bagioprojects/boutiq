'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
  RefreshCw,
  Save,
  Plus,
  Minus,
  Check,
  Package,
} from 'lucide-react';

export interface ProductStockItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  priceFormatted: string;
  stock: number;
  image: string;
  isActive: boolean;
}

export interface StockMetrics {
  totalProducts: number;
  totalStock: number;
  inStockCount: number;
  criticalStockCount: number;
  outOfStockCount: number;
}

interface Props {
  initialProducts: ProductStockItem[];
  initialMetrics: StockMetrics;
}

export function StockManagementClient({ initialProducts, initialMetrics }: Props) {
  const [products, setProducts] = useState<ProductStockItem[]>(initialProducts);
  const [metrics, setMetrics] = useState<StockMetrics>(initialMetrics);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'out_of_stock' | 'in_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draftStock, setDraftStock] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {};
    initialProducts.forEach((p) => {
      map[p.id] = p.stock;
    });
    return map;
  });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [justSavedId, setJustSavedId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Recalculate metrics from current product state
  const computeMetrics = (list: ProductStockItem[]): StockMetrics => {
    let totalStock = 0;
    let criticalStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    list.forEach((p) => {
      totalStock += p.stock;
      if (p.stock === 0) {
        outOfStockCount++;
      } else if (p.stock <= 10) {
        criticalStockCount++;
      } else {
        inStockCount++;
      }
    });

    return {
      totalProducts: list.length,
      totalStock,
      inStockCount,
      criticalStockCount,
      outOfStockCount,
    };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/stock', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        setMetrics(data.metrics || computeMetrics(data.products));
        const newDrafts: Record<number, number> = {};
        data.products.forEach((p: ProductStockItem) => {
          newDrafts[p.id] = p.stock;
        });
        setDraftStock(newDrafts);
        setStatusMessage({ text: 'Stok verileri başarıyla yenilendi.', type: 'success' });
      }
    } catch {
      setStatusMessage({ text: 'Stok verileri güncellenirken hata oluştu.', type: 'error' });
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleStockInputChange = (id: number, val: string) => {
    const num = parseInt(val, 10);
    setDraftStock((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleStockAdjust = (id: number, delta: number) => {
    setDraftStock((prev) => {
      const current = prev[id] !== undefined ? prev[id] : 0;
      const nextVal = Math.max(0, current + delta);
      return {
        ...prev,
        [id]: nextVal,
      };
    });
  };

  const handleSaveStock = async (id: number) => {
    const newStock = draftStock[id] ?? 0;
    setSavingId(id);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock: newStock }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Güncelleme başarısız');
      }

      // Update local state
      const updatedList = products.map((p) => (p.id === id ? { ...p, stock: newStock } : p));
      setProducts(updatedList);
      setMetrics(computeMetrics(updatedList));

      setJustSavedId(id);
      setTimeout(() => setJustSavedId(null), 2000);

      setStatusMessage({ text: 'Stok başarıyla güncellendi.', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Stok kaydedilemedi.', type: 'error' });
    } finally {
      setSavingId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Status filter
      if (activeFilter === 'critical' && (p.stock > 10 || p.stock === 0)) return false;
      if (activeFilter === 'out_of_stock' && p.stock !== 0) return false;
      if (activeFilter === 'in_stock' && p.stock <= 10) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesCat) return false;
      }

      return true;
    });
  }, [products, activeFilter, searchQuery]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Stok & Envanter Yönetimi
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', margin: 0 }}>
            Tüm ürünlerin anlık stok adetlerini görüntüleyin, kritik stokları denetleyin ve hızlıca güncelleyin.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #e2e8f0',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} style={{ color: '#ff6000' }} />
          <span>{isRefreshing ? 'Yenileniyor...' : 'Listeyi Yenile'}</span>
        </button>
      </div>

      {/* TOAST / STATUS MESSAGE */}
      {statusMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* METRIC CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* TOPLAM STOK */}
        <div
          onClick={() => setActiveFilter('all')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: activeFilter === 'all' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Toplam Stok Adedi</span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Boxes size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
            {metrics.totalStock.toLocaleString('tr-TR')}
          </div>
          <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
            Toplam {metrics.totalProducts} farklı ürün
          </div>
        </div>

        {/* NORMAL STOKLU ÜRÜNLER */}
        <div
          onClick={() => setActiveFilter('in_stock')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: activeFilter === 'in_stock' ? '2px solid #16a34a' : '1px solid #e2e8f0',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Yeterli Stok (&gt;10 Adet)</span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a' }}>
            {metrics.inStockCount.toLocaleString('tr-TR')}
          </div>
          <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
            Sorunsuz satışa açık ürünler
          </div>
        </div>

        {/* KRİTİK STOK */}
        <div
          onClick={() => setActiveFilter('critical')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: activeFilter === 'critical' ? '2px solid #ea580c' : '1px solid #e2e8f0',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Kritik Stok (1 - 10 Adet)</span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#fff7ed',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c' }}>
            {metrics.criticalStockCount.toLocaleString('tr-TR')}
          </div>
          <div style={{ fontSize: '12.5px', color: '#ea580c', fontWeight: 500, marginTop: '4px' }}>
            Tükenmek üzere, takviye gerekebilir
          </div>
        </div>

        {/* TÜKENEN ÜRÜNLER */}
        <div
          onClick={() => setActiveFilter('out_of_stock')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: activeFilter === 'out_of_stock' ? '2px solid #dc2626' : '1px solid #e2e8f0',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Tükenen Ürünler (0 Adet)</span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626' }}>
            {metrics.outOfStockCount.toLocaleString('tr-TR')}
          </div>
          <div style={{ fontSize: '12.5px', color: '#dc2626', fontWeight: 500, marginTop: '4px' }}>
            Satışa kapalı veya stoksuz
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeFilter === 'all' ? '#0f172a' : '#f1f5f9',
              color: activeFilter === 'all' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            Tüm Ürünler ({products.length})
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeFilter === 'critical' ? '#ea580c' : '#fff7ed',
              color: activeFilter === 'critical' ? '#ffffff' : '#ea580c',
              transition: 'all 0.15s ease',
            }}
          >
            Kritik Stok ({metrics.criticalStockCount})
          </button>
          <button
            onClick={() => setActiveFilter('out_of_stock')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeFilter === 'out_of_stock' ? '#dc2626' : '#fef2f2',
              color: activeFilter === 'out_of_stock' ? '#ffffff' : '#dc2626',
              transition: 'all 0.15s ease',
            }}
          >
            Tükenenler ({metrics.outOfStockCount})
          </button>
          <button
            onClick={() => setActiveFilter('in_stock')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeFilter === 'in_stock' ? '#16a34a' : '#f0fdf4',
              color: activeFilter === 'in_stock' ? '#ffffff' : '#16a34a',
              transition: 'all 0.15s ease',
            }}
          >
            Yeterli Stok ({metrics.inStockCount})
          </button>
        </div>

        {/* SEARCH */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Ürün adı, SKU veya kategori ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              color: '#0f172a',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#ff6000')}
            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>
      </div>

      {/* TABLE */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Ürün
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Kategori
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Fiyat
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Stok Durumu
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                  Hızlı Stok Düzenle
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <Package size={36} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#475569' }}>
                      Kriterlere uygun ürün bulunamadı
                    </div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>
                      Arama teriminizi veya filtre seçiminizi değiştirmeyi deneyebilirsiniz.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const currentDraft = draftStock[p.id] !== undefined ? draftStock[p.id] : p.stock;
                  const hasChanged = currentDraft !== p.stock;
                  const isSavingThis = savingId === p.id;
                  const isSavedThis = justSavedId === p.id;

                  // Stock badges
                  let badgeBg = '#f0fdf4';
                  let badgeColor = '#16a34a';
                  let badgeDot = '#22c55e';
                  let badgeLabel = `Stokta (${p.stock} Adet)`;

                  if (p.stock === 0) {
                    badgeBg = '#fef2f2';
                    badgeColor = '#dc2626';
                    badgeDot = '#ef4444';
                    badgeLabel = 'Tükendi (0 Adet)';
                  } else if (p.stock <= 10) {
                    badgeBg = '#fff7ed';
                    badgeColor = '#ea580c';
                    badgeDot = '#f97316';
                    badgeLabel = `Kritik (${p.stock} Adet)`;
                  }

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fbfcfd')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* ÜRÜN */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              position: 'relative',
                              width: '46px',
                              height: '46px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              backgroundColor: '#f1f5f9',
                              flexShrink: 0,
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              sizes="46px"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                              SKU: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{p.sku}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* KATEGORİ */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {p.category}
                        </span>
                      </td>

                      {/* FİYAT */}
                      <td style={{ padding: '14px 18px', fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                        {p.priceFormatted}
                      </td>

                      {/* STOK DURUMU */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: badgeDot,
                            }}
                          />
                          {badgeLabel}
                        </span>
                      </td>

                      {/* HIZLI STOK DÜZENLE */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '8px',
                          }}
                        >
                          {/* DECREMENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p.id, -1)}
                            disabled={currentDraft <= 0}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: currentDraft <= 0 ? '#f8fafc' : '#ffffff',
                              color: currentDraft <= 0 ? '#cbd5e1' : '#334155',
                              cursor: currentDraft <= 0 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Minus size={14} />
                          </button>

                          {/* INPUT */}
                          <input
                            type="number"
                            min="0"
                            value={currentDraft}
                            onChange={(e) => handleStockInputChange(p.id, e.target.value)}
                            style={{
                              width: '64px',
                              height: '32px',
                              textAlign: 'center',
                              borderRadius: '6px',
                              border: hasChanged ? '2px solid #ff6000' : '1px solid #cbd5e1',
                              backgroundColor: hasChanged ? '#fffaf5' : '#ffffff',
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: '#0f172a',
                              outline: 'none',
                            }}
                          />

                          {/* INCREMENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p.id, 1)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Plus size={14} />
                          </button>

                          {/* SAVE BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleSaveStock(p.id)}
                            disabled={!hasChanged || isSavingThis}
                            style={{
                              marginLeft: '6px',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: !hasChanged || isSavingThis ? 'default' : 'pointer',
                              backgroundColor: isSavedThis
                                ? '#16a34a'
                                : hasChanged
                                ? '#ff6000'
                                : '#f1f5f9',
                              color: isSavedThis || hasChanged ? '#ffffff' : '#94a3b8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {isSavedThis ? (
                              <>
                                <Check size={14} />
                                <span>Kaydedildi</span>
                              </>
                            ) : isSavingThis ? (
                              <span>Kaydediliyor...</span>
                            ) : (
                              <>
                                <Save size={14} />
                                <span>Kaydet</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

