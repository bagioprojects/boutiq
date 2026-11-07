'use client';

import React, { useState } from 'react';

interface Props {
  initialFlatRate: string;
  initialFreeShippingMin: string;
  initialCarrier: string;
}

export function ShippingSettingsClient({
  initialFlatRate,
  initialFreeShippingMin,
  initialCarrier,
}: Props) {
  const [flatRate, setFlatRate] = useState(initialFlatRate);
  const [freeShippingMin, setFreeShippingMin] = useState(initialFreeShippingMin);
  const [carrier, setCarrier] = useState(initialCarrier);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const cleanMin = freeShippingMin.replace(/[^\d.]/g, '');
      const cleanRate = flatRate.replace(/[^\d.]/g, '');

      const res = await fetch('/api/settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          free_shipping_limit: cleanMin || '1500',
          flat_rate: cleanRate || '49.90',
          carrier: carrier.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Kaydedilemedi.');
      }

      setMessage({ text: 'Kargo ayarları ve ücretsiz kargo limiti başarıyla güncellendi!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Bir hata oluştu.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', maxWidth: '720px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13.5px',
            fontWeight: 600,
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#16a34a' : '#dc2626',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Standart Kargo Ücreti (TL)
          </label>
          <input
            type="text"
            value={flatRate}
            onChange={(e) => setFlatRate(e.target.value)}
            className="form-input"
            style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            placeholder="Örn: 49.90"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Ücretsiz Kargo Sepet Alt Limiti (TL)
          </label>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 6px 0' }}>
            Müşterinin sepet tutarı bu tutara ulaştığında kargo ücretsiz olur ve sepetteki harcama barı %100 dolacaktır.
          </p>
          <input
            type="text"
            value={freeShippingMin}
            onChange={(e) => setFreeShippingMin(e.target.value)}
            className="form-input"
            style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            placeholder="Örn: 1500"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Varsayılan Kargo Firması
          </label>
          <input
            type="text"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="form-input"
            style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            placeholder="Örn: Yurtiçi Kargo / MNG"
          />
        </div>

        <div style={{ marginTop: '8px' }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '12px 28px',
              background: '#ff6000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(255, 96, 0, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            {isSaving ? 'Kaydediliyor...' : 'Kargo Ayarlarını Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}

