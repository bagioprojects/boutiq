'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export interface CategoryMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubCategoryItem {
  name: string;
  slug: string;
  isBadge?: string;
}

interface CategoryGroup {
  title: string;
  mainSlug: string;
  items: SubCategoryItem[];
}

export const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Dışarıya tıklayınca ve ESC tuşuna basınca menüyü kapat
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categoryGroups: CategoryGroup[] = [
    {
      title: 'KADIN ÜST GİYİM',
      mainSlug: 'gomlek-bluz',
      items: [
        { name: 'Gömlek & Bluz', slug: 'gomlek-bluz' },
        { name: 'Sweatshirt & Hoodie', slug: 'sweat-tunik', isBadge: 'Popüler' },
        { name: 'Triko & Kazak', slug: 'triko-kazak' },
        { name: 'Hırka Modelleri', slug: 'kadin-ust-giyim' },
        { name: 'Crop & Body', slug: 'kadin-ust-giyim' },
        { name: 'Tişört & Tunik', slug: 'kadin-ust-giyim' },
      ],
    },
    {
      title: 'ALT & DIŞ GİYİM',
      mainSlug: 'kadin-alt-giyim',
      items: [
        { name: 'Pantolon & Jean (Kot)', slug: 'kadin-alt-giyim', isBadge: 'Trend' },
        { name: 'Ceket & Blazer', slug: 'ceket-yelek' },
        { name: 'Kaban, Mont & Peluş', slug: 'ceket-yelek' },
        { name: 'Etek & Şort', slug: 'kadin-alt-giyim' },
        { name: 'Eşofman & Tayt', slug: 'esofman' },
        { name: 'Kadın Ayakkabı', slug: 'kadin-ayakkabi' },
      ],
    },
    {
      title: 'ELBİSE & ÖZEL FIRSATLAR',
      mainSlug: 'elbise',
      items: [
        { name: 'Elbise Modelleri', slug: 'elbise', isBadge: 'Yeni' },
        { name: 'İkili Takımlar', slug: 'elbise' },
        { name: 'Kadın Büyük Beden', slug: 'buyuk-beden' },
        { name: '3 İplikler (Şardonlu)', slug: '3-iplikler', isBadge: 'Fırsat' },
        { name: 'Beden İndirimli Ürünler', slug: 'beden-indirimli' },
        { name: 'Tüm Yeni Gelenler', slug: 'yeni-gelenler' },
      ],
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fk-categories-mega-menu"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '920px',
        maxWidth: '96vw',
        backgroundColor: '#ffffff',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.14)',
        border: '1px solid #e2e8f0',
        borderRadius: '0 0 14px 14px',
        zIndex: 9999,
        padding: '28px 32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr) 240px',
        gap: '28px',
        boxSizing: 'border-box',
        animation: 'fkMegaFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* İLK 3 KOLON: KATEGORİ GRUPLARI VE ALT KATEGORİLER */}
      {categoryGroups.map((group, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Ana Kategori Başlığı */}
          <Link
            href={`/koleksiyon/${group.mainSlug}`}
            onClick={onClose}
            style={{
              textDecoration: 'none',
              fontSize: '13.5px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: '2px solid #ff6000',
              paddingBottom: '8px',
              width: 'fit-content',
            }}
          >
            <span>{group.title}</span>
            <span style={{ color: '#ff6000', fontSize: '14px' }}>›</span>
          </Link>

          {/* Alt Kategori Listesi (Sıfır Madde İmi, Temiz Butik Tasarım) */}
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
            }}
          >
            {group.items.map((item, itemIdx) => (
              <li key={itemIdx} style={{ listStyle: 'none' }}>
                <Link
                  href={`/koleksiyon/${item.slug}`}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#475569',
                    padding: '3px 0',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ff6000';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.paddingLeft = '0px';
                  }}
                >
                  <span>{item.name}</span>
                  {item.isBadge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: item.isBadge === 'Yeni' ? '#ecfdf5' : item.isBadge === 'Popüler' ? '#fff7ed' : '#fef2f2',
                        color: item.isBadge === 'Yeni' ? '#059669' : item.isBadge === 'Popüler' ? '#ea580c' : '#dc2626',
                        border: `1px solid ${item.isBadge === 'Yeni' ? '#a7f3d0' : item.isBadge === 'Popüler' ? '#fed7aa' : '#fecaca'}`,
                      }}
                    >
                      {item.isBadge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* 4. KOLON: ÖNE ÇIKAN SEZON KAMPANYA VİTRİN KARTI */}
      <div
        style={{
          backgroundColor: '#fafaf9',
          border: '1px solid #e7e5e4',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#ffffff',
              backgroundColor: '#ff6000',
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'inline-block',
              marginBottom: '8px',
            }}
          >
            YENİ SEZON
          </span>
          <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#1c1917', margin: '0 0 6px 0', lineHeight: 1.25 }}>
            FK Butik Özel Koleksiyon
          </h4>
          <p style={{ fontSize: '12px', color: '#78716c', margin: 0, lineHeight: 1.4 }}>
            En trend parçalar, indirimli fiyatlar ve aynı gün kargo fırsatı.
          </p>
        </div>

        <Link
          href="/koleksiyon/yeni-gelenler"
          onClick={onClose}
          style={{
            marginTop: '16px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '9px 14px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '12.5px',
            fontWeight: 700,
            textAlign: 'center',
            display: 'block',
            transition: 'background-color 0.15s ease',
            zIndex: 2,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff6000')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
        >
          Koleksiyonu İncele →
        </Link>
      </div>
    </div>
  );
};

