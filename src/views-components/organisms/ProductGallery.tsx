'use client';

import React, { useState } from 'react';
import { SmartImage } from '../primitives/SmartImage';

export interface ProductGalleryProps {
  images: Array<{
    id: string;
    url: string;
    altText?: string;
  }>;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return <div style={{ aspectRatio: '3/4', backgroundColor: '#f3f4f6', borderRadius: '12px' }} />;
  }

  const activeImage = images[selectedIndex] || images[0]!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '600px' }}>
      {/* Ana Görsel */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <SmartImage
          src={activeImage.url}
          alt={activeImage.altText || 'Ürün Görseli'}
          width={600}
          height={800}
          priority={true}
        />
      </div>

      {/* Küçük Önizleme Resimleri (Thumbnails) */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              style={{
                width: '80px',
                height: '100px',
                padding: 0,
                border: idx === selectedIndex ? '2px solid #111827' : '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                opacity: idx === selectedIndex ? 1 : 0.7,
                transition: 'opacity 0.2s',
              }}
            >
              <img
                src={img.url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

