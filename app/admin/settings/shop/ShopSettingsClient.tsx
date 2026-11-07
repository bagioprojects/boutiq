'use client';

import React, { useState } from 'react';

interface Props {
  initialSettings: Record<string, string>;
}

export function ShopSettingsClient({ initialSettings }: Props) {
  const [shopAccess, setShopAccess] = useState(initialSettings.shop_access || 'Açık (Herkese Erişilebilir)');
  const [cartEnabled, setCartEnabled] = useState(initialSettings.cart_enabled || 'Aktif');
  const [shopLanguage, setShopLanguage] = useState(initialSettings.shop_language || 'Türkçe (TR)');
  const [mobileGrid, setMobileGrid] = useState(initialSettings.mobile_grid || 'Çift sütunlu dizilim (her satırda iki ürün)');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            shop_access: shopAccess,
            cart_enabled: cartEnabled,
            shop_language: shopLanguage,
            mobile_grid: mobileGrid,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Ayarlar kaydedilemedi.');
      }

      setMessage({ text: 'Mağaza seçenekleri başarıyla kaydedildi!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Bir hata oluştu.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '28px',
        maxWidth: '720px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13.5px',
            fontWeight: 600,
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {message.type === 'success' ? '✓ ' : '✕ '}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Dükkan Erişimi
          </label>
          <input
            type="text"
            value={shopAccess}
            onChange={(e) => setShopAccess(e.target.value)}
            className="form-input"
            style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Sepet Fonksiyonu
          </label>
          <input
            type="text"
            value={cartEnabled}
            onChange={(e) => setCartEnabled(e.target.value)}
            className="form-input"
            style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Mağaza Dili
          </label>
          <input
            type="text"
            value={shopLanguage}
            onChange={(e) => setShopLanguage(e.target.value)}
            className="form-input"
            style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Mobil Ürün Dizilimi
          </label>
          <input
            type="text"
            value={mobileGrid}
            onChange={(e) => setMobileGrid(e.target.value)}
            className="form-input"
            style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginTop: '8px' }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '12px 24px',
              background: '#ff6000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}

