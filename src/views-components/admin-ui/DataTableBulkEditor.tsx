'use client';

import React, { useState } from 'react';

export interface BulkEditableProduct {
  id: string;
  title: string;
  sku: string;
  priceAmount: number;
  inventoryQuantity: number;
  status: string;
}

export interface DataTableBulkEditorProps {
  products: BulkEditableProduct[];
  onSave: (updated: BulkEditableProduct[]) => Promise<void>;
}

export const DataTableBulkEditor: React.FC<DataTableBulkEditorProps> = ({ products, onSave }) => {
  const [data, setData] = useState<BulkEditableProduct[]>(products);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (id: string, field: keyof BulkEditableProduct, value: any) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Toplu Ürün Düzenleyici</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '8px 16px',
            backgroundColor: '#008060',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '12px' }}>Ürün Adı</th>
            <th style={{ padding: '12px' }}>SKU</th>
            <th style={{ padding: '12px' }}>Fiyat (TL)</th>
            <th style={{ padding: '12px' }}>Stok</th>
            <th style={{ padding: '12px' }}>Durum</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px' }}>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleFieldChange(item.id, 'title', e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '8px' }}>
                <input
                  type="text"
                  value={item.sku}
                  onChange={(e) => handleFieldChange(item.id, 'sku', e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '8px' }}>
                <input
                  type="number"
                  value={(item.priceAmount / 100).toFixed(2)}
                  onChange={(e) => handleFieldChange(item.id, 'priceAmount', Math.round(parseFloat(e.target.value || '0') * 100))}
                  style={{ width: '90px', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '8px' }}>
                <input
                  type="number"
                  value={item.inventoryQuantity}
                  onChange={(e) => handleFieldChange(item.id, 'inventoryQuantity', parseInt(e.target.value || '0', 10))}
                  style={{ width: '70px', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '8px' }}>
                <select
                  value={item.status}
                  onChange={(e) => handleFieldChange(item.id, 'status', e.target.value)}
                  style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="DRAFT">Taslak</option>
                  <option value="ARCHIVED">Arşivlendi</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

