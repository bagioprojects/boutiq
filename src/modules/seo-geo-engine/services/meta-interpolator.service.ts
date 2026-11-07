export interface ProductMetaInput {
  title: string;
  brandName?: string;
  vendorName?: string;
  priceFormatted: string;
  productType?: string;
  siteName?: string;
}

export class MetaInterpolatorService {
  private readonly defaultSiteName: string;

  constructor(defaultSiteName = 'FKButik') {
    this.defaultSiteName = defaultSiteName;
  }

  generateProductMeta(input: ProductMetaInput): { title: string; description: string; ogTitle: string; ogDescription: string } {
    const brand = input.brandName || input.vendorName || this.defaultSiteName;
    const site = input.siteName || this.defaultSiteName;

    // Google SERP başlık limiti: Maks ~60 karakter
    const title = `${input.title} - ${brand} | ${site}`.slice(0, 60);

    // Meta açıklama limiti: Maks ~155 karakter
    const description = `${brand} imzalı ${input.title}. ${input.priceFormatted} özel fiyatı, hızlı kargo ve kolay iade fırsatıyla ${site}'de.`.slice(0, 155);

    return {
      title,
      description,
      ogTitle: title,
      ogDescription: description,
    };
  }

  generateCollectionMeta(collectionName: string, productCount?: number): { title: string; description: string } {
    const site = this.defaultSiteName;
    const countText = productCount ? ` (${productCount}+ Ürün)` : '';
    const title = `${collectionName} Modelleri ve Fiyatları${countText} | ${site}`.slice(0, 60);
    const description = `En yeni ${collectionName} modellerini ${site}'de keşfedin. Trend tasarımlar, uygun fiyatlar ve avantajlı kargo seçenekleri sizleri bekliyor.`.slice(0, 155);

    return { title, description };
  }
}

