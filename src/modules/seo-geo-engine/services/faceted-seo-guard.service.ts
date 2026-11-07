export interface FilterDecision {
  canonicalUrl: string;
  robotsDirective: 'index, follow' | 'noindex, follow';
  isIndexable: boolean;
  pageTitleSuffix?: string;
}

export class FacetedSeoGuardService {
  /**
   * Faceted navigation arama parametrelerine göre SEO tarama bütçesi (crawl budget)
   * ve Canonical / Noindex kararını verir.
   */
  evaluateFilters(
    baseCollectionUrl: string,
    params: Record<string, string | string[]>,
  ): FilterDecision {
    const keys = Object.keys(params).filter(
      (k) => k !== 'sayfa' && k !== 'page' && params[k] !== undefined && params[k] !== '',
    );

    // Sıralama veya birden fazla filtre varsa crawl budget koruması için noindex, follow
    const hasSort = keys.some((k) => k === 'sirala' || k === 'sort');
    const filterKeys = keys.filter((k) => k !== 'sirala' && k !== 'sort');

    // Tekli yüksek arama hacimli filtre (örneğin sadece ?renk=kirmizi veya sadece ?marka=nike)
    if (!hasSort && filterKeys.length === 1) {
      const key = filterKeys[0]!;
      const val = Array.isArray(params[key]) ? params[key][0] : params[key];

      return {
        canonicalUrl: `${baseCollectionUrl}?${key}=${val}`,
        robotsDirective: 'index, follow',
        isIndexable: true,
        pageTitleSuffix: ` - ${val}`,
      };
    }

    // Filtre yoksa ana sayfa
    if (filterKeys.length === 0 && !hasSort) {
      return {
        canonicalUrl: baseCollectionUrl,
        robotsDirective: 'index, follow',
        isIndexable: true,
      };
    }

    // 2 veya daha fazla filtre ya da sıralama parametresi: noindex, follow ve ana kategoriye Canonical
    return {
      canonicalUrl: baseCollectionUrl,
      robotsDirective: 'noindex, follow',
      isIndexable: false,
    };
  }
}

