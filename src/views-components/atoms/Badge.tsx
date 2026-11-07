import React from 'react';

export interface BadgeProps {
  text: string;
  variant?: 'new' | 'discount' | 'stock' | 'neutral';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ text, variant = 'new', style }) => {
  const variantStyles = {
    new: { backgroundColor: 'var(--color-brand-accent, #e94560)', color: '#ffffff' },
    discount: { backgroundColor: '#dc2626', color: '#ffffff' },
    stock: { backgroundColor: '#10b981', color: '#ffffff' },
    neutral: { backgroundColor: '#f3f4f6', color: '#374151' },
  }[variant];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: 700,
        borderRadius: 'var(--radius-sm, 4px)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        ...variantStyles,
        ...style,
      }}
    >
      {text}
    </span>
  );
};

