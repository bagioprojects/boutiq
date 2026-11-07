import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  style,
  disabled,
  ...rest
}) => {
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 18px', fontSize: '14px' },
    lg: { padding: '14px 24px', fontSize: '16px' },
  }[size];

  const variantStyles = {
    primary: { backgroundColor: 'var(--color-brand-primary, #1a1a2e)', color: '#ffffff', border: 'none' },
    secondary: { backgroundColor: 'var(--color-bg-secondary, #f3f4f6)', color: '#111827', border: '1px solid #d1d5db' },
    accent: { backgroundColor: 'var(--color-brand-accent, #e94560)', color: '#ffffff', border: 'none' },
    outline: { backgroundColor: 'transparent', color: '#111827', border: '1px solid #d1d5db' },
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        borderRadius: 'var(--radius-md, 8px)',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        transition: 'all 0.15s ease-in-out',
        ...sizeStyles,
        ...variantStyles,
        ...style,
      }}
      {...rest}
    >
      {isLoading ? 'Yükleniyor...' : children}
    </button>
  );
};

