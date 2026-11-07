'use client';

import React, { useState } from 'react';

export interface ThemeSectionItem {
  id: string;
  type: 'hero_banner' | 'featured_collection' | 'image_with_text' | 'rich_text' | 'newsletter';
  title: string;
  isEnabled: boolean;
}

export interface ThemeVisualEditorCanvasProps {
  initialSections?: ThemeSectionItem[];
  onSaveLayout?: (sections: ThemeSectionItem[]) => void;
}

export const ThemeVisualEditorCanvas: React.FC<ThemeVisualEditorCanvasProps> = ({
  initialSections = [
    { id: 'sec_1', type: 'hero_banner', title: 'Ana Banner / Slider', isEnabled: true },
    { id: 'sec_2', type: 'featured_collection', title: 'Yeni Sezon Vitrini', isEnabled: true },
    { id: 'sec_3', type: 'image_with_text', title: 'Hakkımızda Blok', isEnabled: true },
    { id: 'sec_4', type: 'newsletter', title: 'E-Bülten Kayıt', isEnabled: true },
  ],
  onSaveLayout,
}) => {
  const [sections, setSections] = useState<ThemeSectionItem[]>(initialSections);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s)),
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const arr = [...prev];
      const temp = arr[index - 1]!;
      arr[index - 1] = arr[index]!;
      arr[index] = temp;
      return arr;
    });
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const arr = [...prev];
      const temp = arr[index + 1]!;
      arr[index + 1] = arr[index]!;
      arr[index] = temp;
      return arr;
    });
  };

  return (
    <div style={{ display: 'flex', gap: '24px', width: '100%', height: '600px', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '12px' }}>
      {/* Sol Panel: Bölüm Sıralama ve Yönetim */}
      <div style={{ width: '320px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Tema Bölümleri (Sections)</h3>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Bölüm sırasını oklar ile değiştirebilirsiniz.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: sec.isEnabled ? '#ffffff' : '#f9fafb',
                opacity: sec.isEnabled ? 1 : 0.6,
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{sec.title}</span>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} style={{ padding: '2px 6px', cursor: 'pointer' }}>↑</button>
                <button type="button" onClick={() => moveDown(idx)} disabled={idx === sections.length - 1} style={{ padding: '2px 6px', cursor: 'pointer' }}>↓</button>
                <button type="button" onClick={() => toggleSection(sec.id)} style={{ padding: '2px 6px', cursor: 'pointer' }}>
                  {sec.isEnabled ? '👁' : '🚫'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {onSaveLayout && (
          <button
            type="button"
            onClick={() => onSaveLayout(sections)}
            style={{ padding: '8px', backgroundColor: '#008060', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            Düzeni Yayınla
          </button>
        )}
      </div>

      {/* Sağ Panel: Canlı Sayfa Önizleme Canvas */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', border: '2px dashed #d1d5db' }}>
        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>CANLI ÖNİZLEME ALANI</span>
        {sections.filter((s) => s.isEnabled).map((sec) => (
          <div
            key={sec.id}
            style={{
              padding: '40px 24px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 700,
              color: '#334155',
            }}
          >
            [{sec.title.toUpperCase()}] BİLEŞENİ
          </div>
        ))}
      </div>
    </div>
  );
};

