export interface JsonLdProductInput {
  name: string;
  description: string;
  sku: string;
  url: string;
  images: string[];
  brandName?: string;
  priceAmount: number;
  priceCurrency: string;
  isAvailable: boolean;
  breadcrumbs: Array<{ name: string; url: string }>;
  ratingValue?: number;
  reviewCount?: number;
}

export class JsonLdGraphService {
  private readonly baseUrl: string;

  constructor(baseUrl = 'https://fkbutik.com') {
    this.baseUrl = baseUrl;
  }

  generateProductGraph(input: JsonLdProductInput): object {
    const productUri = `${input.url}#product`;
    const brandUri = `${this.baseUrl}#organization`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          '@id': productUri,
          name: input.name,
          description: input.description,
          sku: input.sku,
          image: input.images,
          brand: {
            '@type': 'Brand',
            name: input.brandName || 'FKButik',
          },
          offers: {
            '@type': 'Offer',
            price: (input.priceAmount / 100).toFixed(2),
            priceCurrency: input.priceCurrency,
            availability: input.isAvailable
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            url: input.url,
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
              merchantReturnDays: 14,
              returnMethod: 'https://schema.org/ReturnByMail',
              returnFees: 'https://schema.org/FreeReturn',
            },
          },
          ...(input.ratingValue && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: input.ratingValue.toFixed(1),
              reviewCount: input.reviewCount || 1,
            },
          }),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: input.breadcrumbs.map((b, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: b.name,
            item: b.url,
          })),
        },
        {
          '@type': 'Organization',
          '@id': brandUri,
          name: 'FKButik',
          url: this.baseUrl,
          logo: `${this.baseUrl}/logo.png`,
        },
      ],
    };
  }
}

