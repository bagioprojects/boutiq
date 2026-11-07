'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/src/views-components/organisms/Header';
import { Footer } from '@/src/views-components/organisms/Footer';
import { useFavorites } from '@/src/core/favorites/use-favorites';
import { CartStore } from '@/src/core/cart/cart-store';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const { favoriteItems, favoriteCount, isLoaded, removeFavorite } = useFavorites();
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const handleAddToCart = (item: any) => {
    const cleanNum = typeof item.price === 'number'
      ? item.price
      : parseFloat(
          (item.priceFormatted || '319.99').replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.')
        ) || 319.99;

    CartStore.addItem({
      productId: Number(item.id) || 1,
      name: item.name,
      category: item.category || 'Koleksiyon',
      price: cleanNum,
      size: 'STANDART',
      quantity: 1,
      imageUrl: item.imageUrl,
      slug: item.slug,
    });

    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header favoriteCount={favoriteCount} />

      <main style={{ maxWidth: '1280px', margin: '20px auto 60px', padding: '0 20px', width: '100%', flex: 1, boxSizing: 'border-box' }}>
        {/* Sayfa Üst Breadcrumb */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Ana Sayfa</Link>
            <span>/</span>
            <Link href="/hesap" style={{ color: '#64748b', textDecoration: 'none' }}>Hesabım</Link>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: 700 }}>Favorilerim</span>
          </div>
        </div>

        {!isLoaded ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: '14px' }}>
            Favoriler yükleniyor...
          </div>
        ) : favoriteItems.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              padding: '60px 24px',
              textAlign: 'center',
              marginTop: '20px',
            }}
          >
            <Heart size={44} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Favori Listeniz Henüz Boş
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Beğendiğiniz modellerin üzerindeki kalp ikonuna tıklayarak favorilerinize ekleyebilir, fiyatlarını ve stoklarını buradan takip edebilirsiniz.
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
              Koleksiyonları Keşfet
            </Link>
          </div>
        ) : (
          /* ÜRÜNLER IZGARASI (Masaüstü 4 Kolon, Mobil 2 Kolon) */
          <div className="fk-favorites-grid">
            {favoriteItems.map((item) => {
              const isAdded = Boolean(addedItemIds[item.id]);
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {/* Görsel Alanı */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '135%', backgroundColor: '#f1f5f9' }}>
                    <Link href={item.slug || `/urun/${item.id}`} style={{ position: 'absolute', inset: 0 }}>
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    </Link>

                    {/* Sağ Üst: Favorilerden Kaldır Butonu */}
                    <button
                      type="button"
                      onClick={() => removeFavorite(item.id)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Favorilerden Kaldır"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Ürün Detayları & Sepete Ekle Butonu */}
                  <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <h4
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: '0 0 4px 0',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </h4>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: '#ff6000' }}>
                        {item.priceFormatted || `${Number(item.price).toLocaleString('tr-TR')} ₺`}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 8px',
                        backgroundColor: isAdded ? '#16a34a' : '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background-color 0.15s ease',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <ShoppingBag size={14} />
                      <span>{isAdded ? 'Eklendi!' : 'Sepete Ekle'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
