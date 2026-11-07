import React from 'react';

export interface SeoSerpPreviewProps {
  title: string;
  description: string;
  url: string;
}

export const SeoSerpPreview: React.FC<SeoSerpPreviewProps> = ({ title, description, url }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontFamily: 'arial, sans-serif',
        maxWidth: '650px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#202124' }}>
        <span style={{ fontSize: '12px', color: '#4d5156' }}>{url}</span>
      </div>

      <div
        style={{
          fontSize: '20px',
          color: '#1a0dab',
          cursor: 'pointer',
          textDecoration: 'none',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title || 'Örnek Sayfa Başlığı'}
      </div>

      <div
        style={{
          fontSize: '14px',
          color: '#4d5156',
          lineHeight: 1.58,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {description || 'Arama sonuçlarında görünecek meta açıklama metni burada canlı olarak önizlenir.'}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#70757a' }}>
        <span>Başlık: {title.length} / 60 karakter</span>
        <span>Açıklama: {description.length} / 155 karakter</span>
      </div>
    </div>
  );
};

