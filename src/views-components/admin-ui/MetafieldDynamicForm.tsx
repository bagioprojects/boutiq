'use client';

import React, { useState } from 'react';

export interface MetafieldDefinition {
  namespace: string;
  key: string;
  type: 'SINGLE_LINE_TEXT' | 'NUMBER_INTEGER' | 'TRUE_FALSE' | 'COLOR' | 'JSON';
  label: string;
}

export interface MetafieldDynamicFormProps {
  definitions: MetafieldDefinition[];
  initialValues?: Record<string, unknown>;
  onSave: (values: Record<string, unknown>) => void;
}

export const MetafieldDynamicForm: React.FC<MetafieldDynamicFormProps> = ({
  definitions,
  initialValues = {},
  onSave,
}) => {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);

  const handleChange = (key: string, val: unknown) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(values);
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Özel Alanlar (Metafields)</h3>

      {definitions.map((def) => {
        const fieldKey = `${def.namespace}.${def.key}`;
        const val = values[fieldKey];

        return (
          <div key={fieldKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              {def.label} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({fieldKey})</span>
            </label>

            {def.type === 'TRUE_FALSE' ? (
              <input
                type="checkbox"
                checked={Boolean(val)}
                onChange={(e) => handleChange(fieldKey, e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
            ) : def.type === 'COLOR' ? (
              <input
                type="color"
                value={String(val || '#000000')}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
                style={{ height: '36px', width: '60px', padding: '2px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            ) : def.type === 'NUMBER_INTEGER' ? (
              <input
                type="number"
                value={val !== undefined ? Number(val) : ''}
                onChange={(e) => handleChange(fieldKey, parseInt(e.target.value || '0', 10))}
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            ) : (
              <input
                type="text"
                value={String(val || '')}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            )}
          </div>
        );
      })}

      <button
        type="submit"
        style={{
          alignSelf: 'flex-start',
          padding: '8px 16px',
          backgroundColor: '#008060',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Metafield'ları Kaydet
      </button>
    </form>
  );
};

