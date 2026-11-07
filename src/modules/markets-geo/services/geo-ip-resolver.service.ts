export interface GeoLocation {
  country: string; // ISO 3166-1 alpha-2 (TR, US, GB, DE)
  region?: string;
  city?: string;
  currency: string;
  locale: string;
  timezone: string;
}

const COUNTRY_DEFAULTS: Record<string, Omit<GeoLocation, 'country'>> = {
  TR: { currency: 'TRY', locale: 'tr-TR', timezone: 'Europe/Istanbul' },
  US: { currency: 'USD', locale: 'en-US', timezone: 'America/New_York' },
  GB: { currency: 'GBP', locale: 'en-GB', timezone: 'Europe/London' },
  DE: { currency: 'EUR', locale: 'de-DE', timezone: 'Europe/Berlin' },
  FR: { currency: 'EUR', locale: 'fr-FR', timezone: 'Europe/Paris' },
};

const SEARCH_BOT_PATTERNS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'facebot',
  'gptbot',
  'claudebot',
  'perplexitybot',
];

export class GeoIpResolverService {
  resolveFromIp(_ipAddress: string, userAgent: string): GeoLocation {
    // Arama motoru botları veya AI botları için ASLA yönlendirme yapılmaz (SEO kuralı)
    if (this.isSearchBot(userAgent)) {
      return { country: 'TR', ...COUNTRY_DEFAULTS['TR']! };
    }

    const country = this.detectCountryFromIp(_ipAddress);
    const defaults = COUNTRY_DEFAULTS[country] ?? COUNTRY_DEFAULTS['TR']!;

    return { country, ...defaults };
  }

  isSearchBot(userAgent: string): boolean {
    const ua = (userAgent || '').toLowerCase();
    return SEARCH_BOT_PATTERNS.some((pattern) => ua.includes(pattern));
  }

  private detectCountryFromIp(_ip: string): string {
    return 'TR';
  }
}

