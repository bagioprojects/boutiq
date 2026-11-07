import React from 'react';

export interface SeoLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  isExternal?: boolean;
  noFollow?: boolean;
}

export const SeoLink: React.FC<SeoLinkProps> = ({
  href,
  children,
  isExternal = false,
  noFollow = false,
  rel,
  target,
  ...rest
}) => {
  const relParts: string[] = [];

  if (isExternal) {
    relParts.push('noopener', 'noreferrer');
  }

  if (noFollow) {
    relParts.push('nofollow');
  }

  if (rel) {
    relParts.push(rel);
  }

  const finalRel = relParts.length > 0 ? relParts.join(' ') : undefined;
  const finalTarget = isExternal && !target ? '_blank' : target;

  return (
    <a href={href} rel={finalRel} target={finalTarget} {...rest}>
      {children}
    </a>
  );
};

