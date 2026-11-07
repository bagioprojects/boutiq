'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../organisms/Header';
import { Footer } from '../organisms/Footer';
import {
  FacetedSidebar,
  FacetGroup,
  COLOR_DEFINITIONS,
  productMatchesCategory,
  productMatchesSize,
} from '../organisms/FacetedSidebar';
import { ProductCard, ProductCardProps } from '../molecules/ProductCard';
import { CustomSelect } from '../atoms/CustomSelect';

export interface CollectionTemplateProps {
  collectionTitle: string;
  slug?: string;
  categories?: any[];
  breadcrumbs?: Array<{ label: string; url?: string }>;
  facets?: FacetGroup[];
  selectedFacets?: Record<string, string[]>;
  onToggleFacet?: (groupId: string, val: string) => void;
  products: ProductCardProps[];
}

export const CollectionTemplate: React.FC<CollectionTemplateProps> = ({
  collectionTitle,
  slug = 'yeni-gelenler',
  categories,
  products = [],
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(slug || 'yeni-gelenler');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [appliedMin, setAppliedMin] = useState<number | null>(null);
  const [appliedMax, setAppliedMax] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>('recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // URL'deki slug değiştiğinde activeCategory'yi güncelle
  useEffect(() => {
    if (slug) {
      setActiveCategory(slug);
    }
  }, [slug]);

  // Kategori adını dinamik olarak çöz (veritabanından)
  const getCategoryTitle = (catSlug: string) => {
    if (categories && Array.isArray(categories)) {
      // 1. Kök kategorilerde ara
      const root = categories.find((c: any) => c.slug === catSlug);
      if (root) return root.name;

      // 2. Alt kategorilerde ara
      for (const r of categories) {
        if (r.children && Array.isArray(r.children)) {
          const sub = r.children.find((s: any) => s.slug === catSlug);
          if (sub) return sub.name;
        }
      }
    }
    return catSlug.replace(/-/g, ' ').toUpperCase();
  };

  const handleCategorySelect = (newSlug: string) => {
    setActiveCategory(newSlug);
    if (typeof window !== 'undefined') {
      const url = newSlug === 'yeni-gelenler' || newSlug === 'all' ? '/koleksiyon/yeni-gelenler' : `/koleksiyon/${newSlug}`;
      window.history.pushState({}, '', url);
    }
  };

  const handleToggleFacet = (groupId: string, val: string) => {
    if (groupId === 'size') {
      setSelectedSizes((prev) =>
        prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
      );
    } else if (groupId === 'color') {
      setSelectedColors((prev) =>
        prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
      );
    }
  };

  const handleApplyPrice = (minStr: string, maxStr: string) => {
    setPriceMin(minStr);
    setPriceMax(maxStr);
    const minVal = minStr.trim() !== '' ? Number(minStr) : null;
    const maxVal = maxStr.trim() !== '' ? Number(maxStr) : null;
    setAppliedMin(minVal !== null && !isNaN(minVal) ? minVal : null);
    setAppliedMax(maxVal !== null && !isNaN(maxVal) ? maxVal : null);
  };

  const handleClearAll = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceMin('');
    setPriceMax('');
    setAppliedMin(null);
    setAppliedMax(null);
    setActiveCategory('yeni-gelenler');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/koleksiyon/yeni-gelenler');
    }
  };

  const hasActiveFilters = useMemo(() => {
    return (
      selectedSizes.length > 0 ||
      selectedColors.length > 0 ||
      appliedMin !== null ||
      appliedMax !== null ||
      (activeCategory !== 'yeni-gelenler' && activeCategory !== 'all' && activeCategory !== 'tum-kategoriler')
    );
  }, [selectedSizes, selectedColors, appliedMin, appliedMax, activeCategory]);

  // FİLTRELEME MANTIĞI
  const filteredProducts = useMemo(() => {
    const isSearchMode = typeof window !== 'undefined'
      ? Boolean(new URLSearchParams(window.location.search).get('search'))
      : (collectionTitle || '').toUpperCase().includes('ARAMA SONUÇLARI');

    return products.filter((p) => {
      const titleLower = (p.title || '').toLocaleLowerCase('tr-TR');
      const price = p.price || 0;

      // 1. Kategori Filtresi (Arama modunda değilsek geçerlidir)
      if (!isSearchMode && activeCategory && activeCategory !== 'yeni-gelenler' && activeCategory !== 'yeni-urunler' && activeCategory !== 'all' && activeCategory !== 'tum-kategoriler' && activeCategory !== 'cok-satanlar') {
        if (!productMatchesCategory(p, activeCategory)) return false;
      }

      // 2. Fiyat Aralığı Filtresi
      if (appliedMin !== null && price < appliedMin) {
        return false;
      }
      if (appliedMax !== null && price > appliedMax) {
        return false;
      }

      // 3. Beden Filtresi
      if (selectedSizes.length > 0) {
        const matchesSize = selectedSizes.some((sz) => productMatchesSize(p, sz));
        if (!matchesSize) return false;
      }

      // 4. Renk Filtresi (COLOR_DEFINITIONS ile %100 Senkronize)
      if (selectedColors.length > 0) {
        const matchesColor = selectedColors.some((c) => {
          const def = COLOR_DEFINITIONS.find((cd) => cd.value === c);
          return def ? def.match(titleLower) : false;
        });
        if (!matchesColor) return false;
      }

      return true;
    });
  }, [products, activeCategory, appliedMin, appliedMax, selectedSizes, selectedColors, collectionTitle]);

  // SIRALAMA MANTIĞI
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      if (sortOption === 'price-asc') return priceA - priceB;
      if (sortOption === 'price-desc') return priceB - priceA;
      if (sortOption === 'newest') return Number(b.id) - Number(a.id);
      if (sortOption === 'popular') return (b.colorCount || 0) - (a.colorCount || 0);
      return 0;
    });
  }, [filteredProducts, sortOption]);

  const currentCategoryLabel =
    activeCategory === slug && collectionTitle
      ? collectionTitle
      : getCategoryTitle(activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header initialCategories={categories} />

      <main style={{ maxWidth: '1360px', margin: '20px auto 60px', padding: '0 20px', width: '100%', boxSizing: 'border-box', flex: 1 }}>
        {/* MOBİL FİLTRELEME & SIRALAMA BARI */}
        <div className="fk-collection-mobile-bar">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #ff6000',
              borderRadius: '8px',
              color: '#ff6000',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Filtrele {hasActiveFilters && '(Aktif)'}</span>
          </button>

          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            {sortedProducts.length} Ürün
          </span>
        </div>

        <div className="fk-collection-layout" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {/* 1. MASAÜSTÜ SOL KATEGORİ VE FİLTRELEME KENAR ÇUBUĞU */}
          <div className="fk-collection-sidebar-desktop">
            <FacetedSidebar
              categories={categories}
              activeCategorySlug={activeCategory}
              onSelectCategory={handleCategorySelect}
              priceMin={priceMin}
              priceMax={priceMax}
              onApplyPrice={handleApplyPrice}
              selectedValues={{ size: selectedSizes, color: selectedColors }}
              onToggleFacet={handleToggleFacet}
              onClearAll={handleClearAll}
              hasActiveFilters={hasActiveFilters}
              products={products}
            />
          </div>

          {/* 2. SAĞ ÜRÜN LİSTELEME ALANI */}
          <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
            {/* BREADCRUMB NAVİGASYONU (Sadece Breadcrumbs) */}
            <div style={{ marginBottom: '16px' }}>
              <nav style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>
                  Ana Sayfa
                </Link>
                <span>&gt;</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>
                  {currentCategoryLabel}
                </span>
              </nav>
            </div>

            {/* AKTİF FİLTRELER ETİKET ÇUBUĞU */}
            {hasActiveFilters && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '16px',
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                  Filtreler:
                </span>

                {/* Kategori Etiketi */}
                {activeCategory !== 'yeni-gelenler' && activeCategory !== 'all' && activeCategory !== 'tum-kategoriler' && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '16px',
                      padding: '3px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    <span>Kategori: {currentCategoryLabel}</span>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('yeni-gelenler')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                    >
                      ✕
                    </button>
                  </span>
                )}

                {/* Fiyat Etiketi */}
                {(appliedMin !== null || appliedMax !== null) && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '16px',
                      padding: '3px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    <span>
                      Fiyat: {appliedMin !== null ? `${appliedMin} TL` : '0 TL'} - {appliedMax !== null ? `${appliedMax} TL` : '∞'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyPrice('', '')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                    >
                      ✕
                    </button>
                  </span>
                )}

                {/* Beden Etiketleri */}
                {selectedSizes.map((sz) => (
                  <span
                    key={sz}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#fff7ed',
                      border: '1px solid #ffedd5',
                      borderRadius: '16px',
                      padding: '3px 10px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#ff6000',
                    }}
                  >
                    <span>Beden: {sz}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleFacet('size', sz)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff6000', padding: 0 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {/* Renk Etiketleri */}
                {selectedColors.map((c) => (
                  <span
                    key={c}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '16px',
                      padding: '3px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#0f172a',
                      textTransform: 'capitalize',
                    }}
                  >
                    <span>Renk: {c}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleFacet('color', c)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {/* Tümünü Temizle */}
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff6000',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginLeft: 'auto',
                    textDecoration: 'underline',
                  }}
                >
                  Tümünü Temizle
                </button>
              </div>
            )}

            {/* SIRALAMA DROPDOWN BARI (Referans Görsel: [ Önerilen Sıralama ⌄ ]) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <CustomSelect
                value={sortOption}
                onChange={(val) => setSortOption(val)}
                width="200px"
                ariaLabel="Ürün Sıralama Seçenekleri"
                options={[
                  { value: 'recommended', label: 'Önerilen Sıralama' },
                  { value: 'price-asc', label: 'En Düşük Fiyat' },
                  { value: 'price-desc', label: 'En Yüksek Fiyat' },
                  { value: 'newest', label: 'En Yeniler' },
                  { value: 'popular', label: 'Çok Satanlar' },
                ]}
              />

              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                Toplam <strong>{sortedProducts.length}</strong> ürün listeleniyor
              </span>
            </div>

            {/* 3. 4'LÜ / MOBİLDE 2'Lİ ÜRÜN KARTLARI GRİDİ YA DA BOŞ DURUM */}
            {sortedProducts.length > 0 ? (
              <div className="fk-product-grid">
                {sortedProducts.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  margin: '20px 0',
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ margin: '0 auto 16px' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  Seçtiğiniz filtrelere uygun ürün bulunamadı
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                  Farklı bir filtre seçebilir veya tüm filtreleri sıfırlayabilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    backgroundColor: '#ff6000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(255, 96, 0, 0.3)',
                  }}
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBİL FİLTRE ÇEKMECESİ / BOTTOM SHEET */}
        {isMobileFilterOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 -10px 25px rgba(0,0,0,0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Filtrele &amp; Sırala
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              <FacetedSidebar
                categories={categories}
                activeCategorySlug={activeCategory}
                onSelectCategory={(cat) => {
                  handleCategorySelect(cat);
                }}
                priceMin={priceMin}
                priceMax={priceMax}
                onApplyPrice={handleApplyPrice}
                selectedValues={{ size: selectedSizes, color: selectedColors }}
                onToggleFacet={handleToggleFacet}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
                products={products}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleClearAll();
                  }}
                  style={{
                    flex: 1,
                    height: '46px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Temizle
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  style={{
                    flex: 2,
                    height: '46px',
                    backgroundColor: '#ff6000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Sonuçları Gör ({sortedProducts.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
