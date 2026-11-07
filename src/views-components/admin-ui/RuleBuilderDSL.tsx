'use client';

import React, { useState } from 'react';

export interface RuleItem {
  id: string;
  field: 'title' | 'tag' | 'price' | 'inventory_stock' | 'vendor';
  relation: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
  value: string;
}

export interface RuleBuilderDSLProps {
  initialRules?: RuleItem[];
  initialCondition?: 'ALL' | 'ANY';
  onSave: (rules: RuleItem[], condition: 'ALL' | 'ANY') => void;
}

export const RuleBuilderDSL: React.FC<RuleBuilderDSLProps> = ({
  initialRules = [{ id: '1', field: 'price', relation: 'GREATER_THAN', value: '500' }],
  initialCondition = 'ALL',
  onSave,
}) => {
  const [rules, setRules] = useState<RuleItem[]>(initialRules);
  const [condition, setCondition] = useState<'ALL' | 'ANY'>(initialCondition);

  const addRule = () => {
    setRules((prev) => [
      ...prev,
      { id: String(Date.now()), field: 'tag', relation: 'EQUALS', value: '' },
    ]);
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, key: keyof RuleItem, val: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: val } : r)),
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '750px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Akıllı Kural Motoru (Smart Rules DSL)</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
        <span>Ürünler şu koşullarla eşleşmelidir:</span>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as 'ALL' | 'ANY')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        >
          <option value="ALL">Tüm koşulları sağlayanlar (VE / AND)</option>
          <option value="ANY">Herhangi bir koşulu sağlayanlar (VEYA / OR)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rules.map((rule) => (
          <div key={rule.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={rule.field}
              onChange={(e) => updateRule(rule.id, 'field', e.target.value as any)}
              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="title">Ürün Başlığı</option>
              <option value="tag">Etiket (Tag)</option>
              <option value="price">Fiyat (TL)</option>
              <option value="inventory_stock">Stok Miktarı</option>
              <option value="vendor">Tedarikçi / Marka</option>
            </select>

            <select
              value={rule.relation}
              onChange={(e) => updateRule(rule.id, 'relation', e.target.value as any)}
              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="EQUALS">Eşittir</option>
              <option value="NOT_EQUALS">Eşit Değildir</option>
              <option value="GREATER_THAN">Büyüktür</option>
              <option value="LESS_THAN">Küçüktür</option>
              <option value="CONTAINS">İçerir</option>
            </select>

            <input
              type="text"
              value={rule.value}
              placeholder="Değer..."
              onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
              style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />

            {rules.length > 1 && (
              <button
                type="button"
                onClick={() => removeRule(rule.id)}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          type="button"
          onClick={addRule}
          style={{
            padding: '6px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          + Yeni Koşul Ekle
        </button>

        <button
          type="button"
          onClick={() => onSave(rules, condition)}
          style={{
            padding: '6px 16px',
            backgroundColor: '#008060',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Kuralları Kaydet
        </button>
      </div>
    </div>
  );
};

