'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface SearchResultItem {
  id: number;
  name: string;
  price: string;
  category: string;
  image: string;
  url: string;
  sku?: string;
  stock?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const FullScreenSearchModal: React.FC<Props> = ({ isOpen, onClose, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const popularSearches = [
    'Sweatshirt',
    'Kot Pantolon',
    'Triko Kazak',
    'Crop Ceket',
    'Peluş Ceket',
    'Hırka',
    'Gömlek',
    'Palazzo Pantolon',
  ];

  // Arama fonksiyonu
  const executeSearch = useCallback(async (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(clean)}`);
      const data = await res.json();
      
      // Hem dizi formatını hem { success, products } / { data } formatını destekle
      const rawList: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setResults(
        rawList.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.priceFormatted || `${p.price} ₺`,
          category: p.category || 'Kadın Giyim',
          image: p.image || '/images/default.jpg',
          url: p.url || `/urun/${p.id}`,
          sku: p.sku || `FK-${p.id}`,
          stock: p.stock,
        }))
      );
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      if (initialQuery.trim()) {
        executeSearch(initialQuery.trim());
      }
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setResults([]);
      setHasSearched(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialQuery, executeSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Canlı Arama Debounce (Klavyeden yazarken 200ms)
  useEffect(() => {
    if (!isOpen) return;
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      executeSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen, executeSearch]);

  if (!isOpen) return null;

  // Popüler arama butonuna tıklandığında anında çalıştır
  const handlePillClick = (term: string) => {
    setQuery(term);
    executeSearch(term);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/koleksiyon/yeni-gelenler?search=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.18s ease-out',
      }}
    >
      {/* 1. ÜST BAR & LUXURY SEARCH INPUT */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          padding: '16px 24px',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Logo İmzası (Masaüstü) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <span style={{ fontWeight: 900, fontSize: '20px', color: '#ff6000', letterSpacing: '0.04em' }}>FK</span>
            <span style={{ fontWeight: 900, fontSize: '20px', color: '#0f172a', letterSpacing: '0.04em' }}>BUTİK</span>
          </div>

          {/* Arama Formu */}
          <form
            onSubmit={handleSubmit}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '30px',
              padding: '6px 18px',
              border: '2px solid #e2e8f0',
              transition: 'all 0.2s ease',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#ff6000';
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(255, 96, 0, 0.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)';
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff6000"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '12px', flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              placeholder="Ürün adı, koleksiyon, kumaş veya kod arayın... (Örn: Kazak, Sweatshirt, Kot Pantolon)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '15px',
                fontWeight: 600,
                color: '#0f172a',
                padding: '6px 0',
              }}
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                  inputRef.current?.focus();
                }}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
                title="Aramayı Temizle"
              >
                ✕
              </button>
            )}

            <button
              type="submit"
              style={{
                background: '#ff6000',
                border: 'none',
                color: '#ffffff',
                borderRadius: '20px',
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                marginLeft: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              <span>Ara</span>
            </button>
          </form>

          {/* Kapat Butonu */}
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
              fontSize: '18px',
              fontWeight: 800,
              flexShrink: 0,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            aria-label="Kapat"
            title="Kapat (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2. MODAL GÖVDESİ */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px 60px',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* POPÜLER ARAMALAR (YATAY, TEK SIRA, ASLA ALTA TAŞMAYAN ŞIK SCROLL BAR) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '14px 20px',
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              border: '1px solid #edf2f7',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff6000" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Popüler Aramalar
              </span>
            </div>

            {/* Yatay Tek Sıra Butonlar (flex-wrap: nowrap, overflow-x: auto) */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                gap: '8px',
                paddingBottom: '4px',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {popularSearches.map((term) => {
                const isActive = query.toLowerCase() === term.toLowerCase();
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handlePillClick(term)}
                    style={{
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      backgroundColor: isActive ? '#ff6000' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#334155',
                      border: isActive ? '1px solid #ff6000' : '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '7px 16px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(255, 96, 0, 0.3)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#fff7ed';
                        e.currentTarget.style.borderColor = '#ffedd5';
                        e.currentTarget.style.color = '#ff6000';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#334155';
                      }
                    }}
                  >
                    <span>{term}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. ARAMA SONUÇLARI VİTRİNİ */}
          {isLoading ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                border: '1px solid #edf2f7',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  border: '3px solid #ffedd5',
                  borderTopColor: '#ff6000',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Ürünler aranıyor...</div>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>"{query}" ile ilgili sonuçlar taranıyor</p>
            </div>
          ) : results.length > 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                border: '1px solid #edf2f7',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    Bulunan Ürünler
                  </span>
                  <span
                    style={{
                      backgroundColor: '#fff7ed',
                      color: '#ff6000',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    {results.length} Sonuç
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff6000',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Tümünü Listede Aç</span>
                  <span>→</span>
                </button>
              </div>

              {/* MASAÜSTÜ LÜKS 2 KOLONLU ÜRÜN KARTLARI GRİDİ */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                  gap: '12px',
                }}
              >
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      backgroundColor: '#ffffff',
                      border: '1px solid #f1f5f9',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fafafa';
                      e.currentTarget.style.borderColor = '#ffedd5';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 96, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                    }}
                  >
                    {/* Ürün Görseli */}
                    <div
                      style={{
                        width: '68px',
                        height: '84px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#f8fafc',
                        flexShrink: 0,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>

                    {/* Ürün Bilgisi */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          color: '#ff6000',
                          fontWeight: 700,
                          backgroundColor: '#fff7ed',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginBottom: '4px',
                        }}
                      >
                        {item.category}
                      </div>

                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#0f172a',
                          lineHeight: 1.35,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </div>

                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        Kod: {item.sku}
                      </div>
                    </div>

                    {/* Fiyat ve Buton */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                        {item.price}
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          color: '#ff6000',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginTop: '6px',
                        }}
                      >
                        <span>İncele</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Tüm Sonuçlar Alt Butonu */}
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 28px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff6000')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
                >
                  "{query}" İçin Tüm Sonuçları Gör ({results.length} Ürün) →
                </button>
              </div>
            </div>
          ) : hasSearched && query.trim() ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                border: '1px solid #edf2f7',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#fff7ed',
                  color: '#ff6000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                Sonuç Bulunamadı
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', margin: '0 auto 18px', lineHeight: 1.5 }}>
                "<strong>{query}</strong>" aramasıyla eşleşen ürün bulunamadı. Lütfen kelimeyi kontrol edin veya popüler aramalardan birini seçin.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handlePillClick('Sweatshirt')}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  Sweatshirt Modelleri
                </button>
                <button
                  type="button"
                  onClick={() => handlePillClick('Kot Pantolon')}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  Kot Pantolonlar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
