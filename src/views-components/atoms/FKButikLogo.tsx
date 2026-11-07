import React from 'react';

export interface FKButikLogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  variant?: 'dark' | 'light';
}

export const FKButikLogo: React.FC<FKButikLogoProps> = ({
  width = 184,
  height = 48,
  className,
  variant = 'dark',
}) => {
  const isLight = variant === 'light';
  const butikFill = isLight ? '#ffffff' : 'url(#butikBlackGradReact)';
  const subtextFill = isLight ? '#94a3b8' : '#64748b';
  const dividerStroke = isLight ? '#334155' : '#e2e8f0';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 184 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FK BUTİK Luxury Fashion Logo"
    >
      <defs>
        <linearGradient id="fkOrangeGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7a1a"/>
          <stop offset="100%" stopColor="#ff5500"/>
        </linearGradient>
        <linearGradient id="butikBlackGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e2430"/>
          <stop offset="100%" stopColor="#0f131a"/>
        </linearGradient>
      </defs>

      {/* SOL: FK HARFLERİ (Saf Vektörel Glif - Taban: y=35, Tavan: y=11.9) */}
      <g fill="url(#fkOrangeGradReact)">
        <g transform="translate(6.0, 35) scale(0.016107, -0.016107)">
          <path d="M993 1171H487V819H952V557H487V0H164V1434H993Z"/>
        </g>
        <g transform="translate(24.44, 35) scale(0.016107, -0.016107)">
          <path d="M1356 0H948L530 623Q518 641 492 702H487V0H164V1434H487V756H492Q504 784 532 836L928 1434H1313L813 750Z"/>
        </g>
        <circle cx="23.65" cy="11.5" r="1.4" fill="#ff7a1a"/>
      </g>

      {/* AYIRICI DİKEY TASARIM ÇİZGİSİ */}
      <line x1="53.85" y1="9" x2="53.85" y2="35" stroke={dividerStroke} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="53.85" cy="22" r="2.5" fill="#ff6000"/>

      {/* SAĞ: BUTİK HARFLERİ (FK İLE %100 BİREBİR AYNI TABAN VE TAVAN HİZASI) */}
      <g fill={butikFill}>
        <g transform="translate(63.85, 35) scale(0.016107, -0.016107)">
          <path d="M164 0V1434H686Q926 1434 1055.0 1346.0Q1184 1258 1184 1098Q1184 982 1105.5 895.0Q1027 808 905 774V770Q1058 751 1149.5 657.0Q1241 563 1241 428Q1241 231 1100.0 115.5Q959 0 715 0ZM487 1196V856H629Q729 856 786.5 904.5Q844 953 844 1038Q844 1196 608 1196ZM487 616V238H662Q774 238 837.5 290.0Q901 342 901 432Q901 518 838.5 567.0Q776 616 664 616Z"/>
        </g>
        <g transform="translate(87.58, 35) scale(0.016107, -0.016107)">
          <path d="M1333 621Q1333 -25 731 -25Q147 -25 147 606V1434H471V602Q471 254 743 254Q1010 254 1010 590V1434H1333Z"/>
        </g>
        <g transform="translate(114.01, 35) scale(0.016107, -0.016107)">
          <path d="M1171 1171H762V0H438V1171H31V1434H1171Z"/>
        </g>
        <g transform="translate(135.91, 35) scale(0.016107, -0.016107)">
          <path d="M487 0H164V1434H487Z"/>
        </g>
        <g transform="translate(148.94, 35) scale(0.016107, -0.016107)">
          <path d="M1356 0H948L530 623Q518 641 492 702H487V0H164V1434H487V756H492Q504 784 532 836L928 1434H1313L813 750Z"/>
        </g>
      </g>

      {/* 'İ' HARFİNİN ÖZEL TURUNCU TASARIM NOKTASI (Matematiksel Gövde Merkezinde: cx=141.14, cy=7.0) */}
      <circle cx="141.14" cy="7.0" r="2.4" fill="#ff6000"/>

      {/* ALT LÜKS İMZA */}
      <g id="brand-subtext">
        <line x1="63.8" y1="39" x2="170.4" y2="39" stroke="#ff6000" strokeWidth="0.75" strokeOpacity="0.45"/>
        <text x="63.8" y="45.5" fontFamily="'Montserrat', 'Inter', -apple-system, sans-serif" fontSize="6.2" fontWeight="700" fill={subtextFill} letterSpacing="0.22em">EXCLUSIVE COLLECTION</text>
      </g>
    </svg>
  );
};
