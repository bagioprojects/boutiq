'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { ProductCardProps } from '../molecules/ProductCard';

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  id: string;
  title: string;
  options: FacetOption[];
}

export interface ColorDef {
  label: string;
  value: string;
  hex: string;
  border?: string;
  match: (text: string) => boolean;
}

export const COLOR_DEFINITIONS: ColorDef[] = [
  { label: 'Siyah', value: 'siyah', hex: '#0f172a', match: (t) => /siyah/i.test(t) },
  { label: 'Ekru / Beyaz', value: 'ekru', hex: '#ffffff', border: '#cbd5e1', match: (t) => /ekru|beyaz/i.test(t) },
  { label: 'Bej / Krem', value: 'bej', hex: '#d8c29d', match: (t) => /bej|krem/i.test(t) },
  { label: 'Mavi / Laci', value: 'mavi', hex: '#2563eb', match: (t) => /mavi|laci|bebemavisi/i.test(t) },
  { label: 'Kırmızı / Bordo', value: 'kirmizi', hex: '#dc2626', match: (t) => /kırmızı|kirmizi|bordo/i.test(t) },
  { label: 'Pembe', value: 'pembe', hex: '#f472b6', match: (t) => /pembe/i.test(t) },
  { label: 'Gri / Füme', value: 'gri', hex: '#94a3b8', match: (t) => /gri|füme|fume/i.test(t) },
  { label: 'Kahve', value: 'kahve', hex: '#78350f', match: (t) => /kahve|kahverengi/i.test(t) },
];

export function productMatchesColor(title: string, colorValue: string): boolean {
  const titleLower = title.toLocaleLowerCase('tr-TR');
  const def = COLOR_DEFINITIONS.find((c) => c.value === colorValue);
  return def ? def.match(titleLower) : false;
}

export function productMatchesSize(p: { availableSizes?: string[] }, sz: string): boolean {
  const sizes = p.availableSizes || ['STANDART'];
  if (sizes.includes(sz)) return true;
  if (sz === 'STANDART' && sizes.includes('STANDART')) return true;
  if (sz === '36' && (sizes.includes('S') || sizes.includes('26') || sizes.includes('36'))) return true;
  if (sz === '38' && (sizes.includes('M') || sizes.includes('28') || sizes.includes('38'))) return true;
  if (sz === '40' && (sizes.includes('L') || sizes.includes('30') || sizes.includes('40'))) return true;
  if (sz === '42' && (sizes.includes('XL') || sizes.includes('32') || sizes.includes('42'))) return true;
  if (sz === 'S' && (sizes.includes('36') || sizes.includes('26') || sizes.includes('S'))) return true;
  if (sz === 'M' && (sizes.includes('38') || sizes.includes('28') || sizes.includes('M'))) return true;
  if (sz === 'L' && (sizes.includes('40') || sizes.includes('30') || sizes.includes('L'))) return true;
  if (sz === 'XL' && (sizes.includes('42') || sizes.includes('32') || sizes.includes('XL'))) return true;
  return false;
}

export function productMatchesCategory(p: { title?: string; categoryName?: string }, catSlug?: string): boolean {
  if (!catSlug || catSlug === 'yeni-gelenler' || catSlug === 'yeni-urunler' || catSlug === 'all' || catSlug === 'tum-kategoriler' || catSlug === 'cok-satanlar') {
    return true;
  }
  const titleLower = (p.title || '').toLocaleLowerCase('tr-TR');
  const catLower = (p.categoryName || '').toLocaleLowerCase('tr-TR');
  const cat = catSlug.toLowerCase();

  if (cat === 'alt-giyim' || cat === 'kadin-alt-giyim') {
    return catLower.includes('alt') || /pantolon|kot|jean|etek|şort|sort|esofman|eşofman/.test(titleLower);
  }
  if (cat === 'pantolon' || cat === 'pantolon-jean') {
    return /pantolon|kot|jean|palazzo|baggy/.test(titleLower);
  }
  if (cat === 'etek') {
    return titleLower.includes('etek');
  }
  if (cat === 'sort') {
    return /şort|sort/.test(titleLower);
  }
  if (cat === 'esofman-alti' || cat === 'esofman') {
    return /eşofman|esofman|tayt|pijama/.test(titleLower);
  }
  if (cat === 'ust-giyim' || cat === 'kadin-ust-giyim') {
    return catLower.includes('üst') || /gömlek|gomlek|bluz|sweat|triko|kazak|hırka|hirka|body|crop|ceket/.test(titleLower);
  }
  if (cat === 'sweat-tunik' || cat === 'sweat') {
    return /sweat|hoodie|tunik|kapüşonlu/.test(titleLower);
  }
  if (cat === 'triko' || cat === 'triko-kazak') {
    return /triko|kazak/.test(titleLower);
  }
  if (cat === 'hirka') {
    return /hırka|hirka/.test(titleLower);
  }
  if (cat === 'gomlek' || cat === 'gomlek-bluz') {
    return /gömlek|gomlek|polo/.test(titleLower);
  }
  if (cat === 'bluz') {
    return titleLower.includes('bluz');
  }
  if (cat === 'ceket-mont' || cat === 'ceket-yelek') {
    return /ceket|yelek|kaban|mont|peluş/.test(titleLower);
  }
  if (cat === 'yelek') {
    return titleLower.includes('yelek');
  }
  if (cat === 'atlet') {
    return /atlet|body|ribana/.test(titleLower);
  }
  if (cat === 'elbise' || cat === 'gunluk-elbise' || cat === 'triko-elbise' || cat === 'sik-abiye-elbise') {
    return titleLower.includes('elbise');
  }
  if (cat === 'takim') {
    return /takım|takim/.test(titleLower);
  }
  if (cat === 'buyuk-beden' || cat === 'kadin-buyuk-beden') {
    return /büyük|buyuk|42|xl/i.test(titleLower) || /büyük|buyuk/i.test(catLower);
  }
  if (cat.includes('aksesuar') || cat.includes('kolye') || cat.includes('canta') || cat.includes('bileklik') || cat.includes('sal-fular')) {
    return catLower.includes('aksesuar') || /kolye|çanta|canta|bileklik|şal|sal|fular/.test(titleLower);
  }
  return true;
}

export interface FacetedSidebarProps {
  categories?: any[];
  facets?: FacetGroup[];
  selectedValues?: Record<string, string[]>;
  onToggleFacet?: (groupId: string, value: string) => void;
  onClearAll?: () => void;
  activeCategorySlug?: string;
  onSelectCategory?: (slug: string) => void;
  priceMin?: string;
  priceMax?: string;
  onApplyPrice?: (min: string, max: string) => void;
  hasActiveFilters?: boolean;
  products?: ProductCardProps[];
}

export const FacetedSidebar: React.FC<FacetedSidebarProps> = ({
  categories = [],
  facets = [],
  selectedValues = {},
  onToggleFacet = () => {},
  onClearAll,
  activeCategorySlug = 'yeni-gelenler',
  onSelectCategory,
  priceMin = '',
  priceMax = '',
  onApplyPrice,
  hasActiveFilters = false,
  products = [],
}) => {
  const [isBuyukBedenOpen, setIsBuyukBedenOpen] = useState(false);
  const [localMin, setLocalMin] = useState(priceMin);
  const [localMax, setLocalMax] = useState(priceMax);

  useEffect(() => {
    setLocalMin(priceMin);
  }, [priceMin]);

  useEffect(() => {
    setLocalMax(priceMax);
  }, [priceMax]);

  const handlePriceSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onApplyPrice) {
      onApplyPrice(localMin, localMax);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent, slug: string) => {
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(slug);
    }
  };

  // Kategori kapsamındaki ürünler (Renk ve beden sayıları bu ürünlere göre hesaplanır)
  const scopedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (!activeCategorySlug || activeCategorySlug === 'yeni-gelenler' || activeCategorySlug === 'all' || activeCategorySlug === 'tum-kategoriler' || activeCategorySlug === 'yeni-urunler' || activeCategorySlug === 'cok-satanlar') {
      return products;
    }
    return products.filter((p) => productMatchesCategory(p, activeCategorySlug));
  }, [products, activeCategorySlug]);

  // Dinamik Renk Sayıları (Ürünlerle %100 Senkronize)
  const colorsList = useMemo(() => {
    return COLOR_DEFINITIONS.map((c) => {
      const count = scopedProducts.filter((p) => c.match((p.title || '').toLocaleLowerCase('tr-TR'))).length;
      return {
        ...c,
        count,
      };
    });
  }, [scopedProducts]);

  // Dinamik Beden Sayıları
  const sizeOptions = ['STANDART', 'XS', 'S', 'M', 'L', 'XL', '26', '28', '30', '32', '36', '38', '40', '42'];
  const dynamicSizeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sizeOptions.forEach((sz) => {
      counts[sz] = scopedProducts.filter((p) => productMatchesSize(p, sz)).length;
    });
    return counts;
  }, [scopedProducts, sizeOptions]);

  // Dinamik Kategori Sayıcı
  const getCategoryCount = (slug: string) => {
    if (!products || products.length === 0) return 0;
    return products.filter((p) => productMatchesCategory(p, slug)).length;
  };

  const selectedSizes = selectedValues['size'] || [];
  const selectedColors = selectedValues['color'] || [];

  return (
    <aside
      style={{
        width: '240px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontSize: '13px',
      }}
    >
      {/* ========================================================
         1. KATEGORİ HİYERARŞİSİ (Veritabanı ile Gerçek Senkronize)
         ======================================================== */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
          Kategori
        </h3>
        <a
          href="/koleksiyon/yeni-gelenler"
          onClick={(e) => handleCategoryClick(e, 'yeni-gelenler')}
          style={{
            fontSize: '12.5px',
            color: activeCategorySlug === 'yeni-gelenler' || activeCategorySlug === 'all' || activeCategorySlug === 'tum-kategoriler' ? '#ff6000' : '#475569',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            cursor: 'pointer',
          }}
        >
          <span>Tüm kategoriler</span>
          <span style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: 600 }}>({products?.length || 0})</span>
        </a>

        {/* Dinamik Kategori Ağacı */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {categories && categories.length > 0 ? (
            categories.map((root: any) => {
              const hasChildren = root.children && root.children.length > 0;
              const isRootActive = activeCategorySlug === root.slug;
              const rootCount = getCategoryCount(root.slug);

              if (!hasChildren) {
                return (
                  <a
                    key={root.id}
                    href={`/koleksiyon/${root.slug}`}
                    onClick={(e) => handleCategoryClick(e, root.slug)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: isRootActive ? '#ff6000' : '#334155',
                      textDecoration: 'none',
                      fontWeight: isRootActive ? 800 : 600,
                      padding: '4px 0',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    <span>{root.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: 500 }}>({rootCount})</span>
                  </a>
                );
              }

              return (
                <div key={root.id} style={{ marginBottom: '6px' }}>
                  <a
                    href={`/koleksiyon/${root.slug}`}
                    onClick={(e) => handleCategoryClick(e, root.slug)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: isRootActive ? '#ff6000' : '#0f172a',
                      fontWeight: 800,
                      fontSize: '13px',
                      textDecoration: 'none',
                      padding: '4px 0',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{root.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: 600 }}>({rootCount})</span>
                  </a>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '12px', marginTop: '4px' }}>
                    {root.children.map((sub: any) => {
                      const isSubActive = activeCategorySlug === sub.slug;
                      const subCount = getCategoryCount(sub.slug);
                      return (
                        <a
                          key={sub.id}
                          href={`/koleksiyon/${sub.slug}`}
                          onClick={(e) => handleCategoryClick(e, sub.slug)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: isSubActive ? '#ff6000' : '#475569',
                            textDecoration: 'none',
                            fontSize: '12.5px',
                            fontWeight: isSubActive ? 800 : 500,
                            padding: '2px 0',
                            cursor: 'pointer',
                          }}
                        >
                          <span>• {sub.name}</span>
                          <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500 }}>({subCount})</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href="/koleksiyon/yeni-urunler"
                onClick={(e) => handleCategoryClick(e, 'yeni-urunler')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: activeCategorySlug === 'yeni-urunler' ? '#ff6000' : '#334155',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                <span>YENİ ÜRÜNLER</span>
                <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>({getCategoryCount('yeni-urunler')})</span>
              </a>
              <a
                href="/koleksiyon/ust-giyim"
                onClick={(e) => handleCategoryClick(e, 'ust-giyim')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: activeCategorySlug === 'ust-giyim' ? '#ff6000' : '#334155',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                <span>ÜST GİYİM</span>
                <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>({getCategoryCount('ust-giyim')})</span>
              </a>
              <a
                href="/koleksiyon/alt-giyim"
                onClick={(e) => handleCategoryClick(e, 'alt-giyim')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: activeCategorySlug === 'alt-giyim' ? '#ff6000' : '#334155',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                <span>ALT GİYİM</span>
                <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>({getCategoryCount('alt-giyim')})</span>
              </a>
            </div>
          )}
        </div>

        {/* Akordeon: KADIN BÜYÜK BEDEN */}
        {getCategoryCount('buyuk-beden') > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setIsBuyukBedenOpen(!isBuyukBedenOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                padding: '6px 0',
                cursor: 'pointer',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '13px',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: isBuyukBedenOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span>KADIN BÜYÜK BEDEN</span>
              </span>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>({getCategoryCount('buyuk-beden')})</span>
            </button>

            {isBuyukBedenOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', paddingLeft: '18px', marginTop: '6px' }}>
                <a
                  href="/koleksiyon/buyuk-beden"
                  onClick={(e) => handleCategoryClick(e, 'buyuk-beden')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: activeCategorySlug === 'buyuk-beden' ? '#ff6000' : '#475569',
                    textDecoration: 'none',
                    fontSize: '12.5px',
                    fontWeight: activeCategorySlug === 'buyuk-beden' ? 800 : 500,
                    padding: '2px 0',
                    cursor: 'pointer',
                  }}
                >
                  <span>&gt; Kadın Büyük Beden</span>
                  <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>({getCategoryCount('buyuk-beden')})</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AYIRICI ÇİZGİ */}
      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

      {/* ========================================================
         2. FİLTRELER BÖLÜMÜ (Fiyat Aralığı, Beden, Renk)
         ======================================================== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Filtreler
          </h3>
          {hasActiveFilters && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff6000',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              Temizle
            </button>
          )}
        </div>

        {/* Fiyat Filtresi (Min - Max - Ara) */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
            Fiyat Aralığı
          </span>
          <form onSubmit={handlePriceSubmit} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Min"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              style={{
                width: '100%',
                height: '34px',
                padding: '0 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>-</span>
            <input
              type="number"
              placeholder="Max"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              style={{
                width: '100%',
                height: '34px',
                padding: '0 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
            <button
              type="submit"
              style={{
                height: '34px',
                padding: '0 12px',
                backgroundColor: '#ff6000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(255, 96, 0, 0.3)',
                transition: 'background-color 0.15s ease',
                flexShrink: 0,
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e65600')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff6000')}
            >
              Ara
            </button>
          </form>
        </div>

        {/* Beden Filtresi */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
              Beden
            </span>
            {selectedSizes.length > 0 && (
              <span style={{ fontSize: '11px', color: '#ff6000', fontWeight: 700 }}>
                ({selectedSizes.length} seçildi)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {sizeOptions.map((sz) => {
              const isSelected = selectedSizes.includes(sz);
              const count = dynamicSizeCounts[sz] || 0;
              const hasItems = count > 0;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onToggleFacet('size', sz)}
                  title={`${sz}: ${count} ürün mevcut`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '32px',
                    height: '28px',
                    padding: '0 6px',
                    border: isSelected ? '1.5px solid #ff6000' : '1px solid #cbd5e1',
                    borderRadius: '4px',
                    backgroundColor: isSelected ? '#fff7ed' : hasItems ? '#ffffff' : '#f8fafc',
                    color: isSelected ? '#ff6000' : hasItems ? '#334155' : '#94a3b8',
                    fontSize: '11.5px',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    opacity: hasItems ? 1 : 0.55,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* Renk Filtresi (Canlı Ürün Veritabanı ile Tam Senkronize) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
              Renk
            </span>
            {selectedColors.length > 0 && (
              <span style={{ fontSize: '11px', color: '#ff6000', fontWeight: 700 }}>
                ({selectedColors.length} seçildi)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {colorsList.map((c) => {
              const isSelected = selectedColors.includes(c.value);
              return (
                <label
                  key={c.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: isSelected ? '#ff6000' : '#475569',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    padding: '2px 0',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleFacet('color', c.value)}
                      style={{ accentColor: '#ff6000', width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: c.border ? `1px solid ${c.border}` : '1px solid rgba(0,0,0,0.1)',
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <span>{c.label}</span>
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: isSelected ? 700 : 400 }}>({c.count})</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Tümünü Temizle Butonu (Filtreler Aktifse) */}
        {hasActiveFilters && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            style={{
              width: '100%',
              height: '36px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#ff6000',
              cursor: 'pointer',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#fff7ed';
              e.currentTarget.style.borderColor = '#ffedd5';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <span>✕</span>
            <span>Filtreleri Temizle</span>
          </button>
        )}
      </div>
    </aside>
  );
};
