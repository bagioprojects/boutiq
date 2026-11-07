import type { Metadata } from 'next';
import './globals.css';
import { MobileBottomNav } from '@/src/views-components/organisms/MobileBottomNav';
import { CookieConsentBanner } from '@/src/views-components/organisms/CookieConsentBanner';

export const metadata: Metadata = {
  metadataBase: new URL('https://fkbutik.com'),
  title: 'FK Butik | Kadın Giyim & Yeni Sezon Koleksiyonu',
  description: 'FK Butik en trend kadın giyim modelleri, elbiseler, gömlekler ve indirimli fırsat ürünleriyle sizlerle.',
  icons: {
    icon: '/images/fkbutik_logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/storefront.css?v=4.0" />
        <link rel="stylesheet" href="/mobile-bottom-nav.css?v=1.0" />
      </head>
      <body>
        {children}
        <CookieConsentBanner />
        <MobileBottomNav />
      </body>
    </html>
  );
}

