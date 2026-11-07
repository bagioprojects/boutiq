import React from 'react';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
      <a href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>
        Ana Sayfa
      </a>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <span style={{ color: '#9ca3af' }}>/</span>
            {isLast || !item.url ? (
              <span style={{ color: '#111827', fontWeight: 600 }}>{item.label}</span>
            ) : (
              <a href={item.url} style={{ color: '#6b7280', textDecoration: 'none' }}>
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

