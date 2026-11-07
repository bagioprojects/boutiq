import React from 'react';

export interface VariantOption {
  name: string; // 'Beden', 'Renk' vb.
  values: string[]; // ['S', 'M', 'L'] veya ['Siyah', 'Beyaz']
}

export interface VariantSelectorProps {
  options: VariantOption[];
  selectedOptions: Record<string, string>;
  onSelectOption: (optionName: string, value: string) => void;
  availableCombinations?: string[];
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  options,
  selectedOptions,
  onSelectOption,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {options.map((opt) => (
        <div key={opt.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
            {opt.name}: <strong style={{ color: '#111827' }}>{selectedOptions[opt.name] || 'Seçiniz'}</strong>
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {opt.values.map((val) => {
              const isSelected = selectedOptions[opt.name] === val;

              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onSelectOption(opt.name, val)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: isSelected ? '2px solid #111827' : '1px solid #d1d5db',
                    backgroundColor: isSelected ? '#111827' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#111827',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

