export interface ProductSearchDoc {
  id: string;
  title: string;
  slug: string;
  vendorName: string | null;
  productType: string | null;
  tags: string[];
  status: string;
  lowestPrice: number;
  highestPrice: number;
  currency: string;
  primaryImageUrl: string | null;
  brandName: string | null;
  collectionIds: string[];
  isAvailable: boolean;
  variantCount: number;
  createdAt: number;
}

export interface ProductSearchFilters {
  collectionIds?: string[];
  brandIds?: string[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  status?: string;
}

export interface SearchResultMeta {
  total: number;
  page: number;
  limit: number;
  processingTimeMs: number;
  facetDistribution?: Record<string, Record<string, number>>;
}

export interface MinimalMeiliSearchClient {
  index(uid: string): {
    updateSettings(settings: Record<string, unknown>): Promise<unknown>;
    addDocuments(documents: unknown[]): Promise<unknown>;
    deleteDocument(documentId: string): Promise<unknown>;
    search(query: string, options?: Record<string, unknown>): Promise<{
      hits: ProductSearchDoc[];
      estimatedTotalHits?: number;
      processingTimeMs: number;
      facetDistribution?: Record<string, Record<string, number>>;
    }>;
  };
}

export class SearchService {
  private readonly PRODUCT_INDEX = 'products';

  constructor(private readonly client: MinimalMeiliSearchClient) {}

  async configureProductIndex(): Promise<void> {
    const index = this.client.index(this.PRODUCT_INDEX);

    await index.updateSettings({
      searchableAttributes: ['title', 'vendorName', 'productType', 'tags', 'brandName'],
      filterableAttributes: ['collectionIds', 'tags', 'status', 'isAvailable', 'brandName', 'lowestPrice'],
      sortableAttributes: ['lowestPrice', 'createdAt', 'title'],
      faceting: { maxValuesPerFacet: 100 },
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
      },
      synonyms: {
        tişört: ['tshirt', 't-shirt', 'tisort'],
        mont: ['kaban', 'ceket', 'parka'],
        pantolon: ['jean', 'kot'],
        ayakkabı: ['sneaker', 'bot'],
      },
    });
  }

  async indexProduct(doc: ProductSearchDoc): Promise<void> {
    await this.client.index(this.PRODUCT_INDEX).addDocuments([doc]);
  }

  async indexProducts(docs: ProductSearchDoc[]): Promise<void> {
    if (docs.length === 0) return;
    await this.client.index(this.PRODUCT_INDEX).addDocuments(docs);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.client.index(this.PRODUCT_INDEX).deleteDocument(id);
  }

  async search(
    query: string,
    filters: ProductSearchFilters,
    page: { offset: number; limit: number },
  ): Promise<{ items: ProductSearchDoc[]; meta: SearchResultMeta }> {
    const filterExpression = this.buildFilterExpression(filters);

    const result = await this.client.index(this.PRODUCT_INDEX).search(query, {
      offset: page.offset,
      limit: page.limit,
      filter: filterExpression,
      facets: ['tags', 'brandName'],
      attributesToRetrieve: ['*'],
    });

    return {
      items: result.hits,
      meta: {
        total: result.estimatedTotalHits ?? 0,
        page: Math.floor(page.offset / page.limit) + 1,
        limit: page.limit,
        processingTimeMs: result.processingTimeMs,
        facetDistribution: result.facetDistribution,
      },
    };
  }

  private buildFilterExpression(filters: ProductSearchFilters): string | undefined {
    const parts: string[] = [];

    if (filters.collectionIds?.length) {
      parts.push(`collectionIds IN [${filters.collectionIds.map((id) => `"${id}"`).join(',')}]`);
    }

    if (filters.isAvailable !== undefined) {
      parts.push(`isAvailable = ${String(filters.isAvailable)}`);
    }

    if (filters.minPrice !== undefined) {
      parts.push(`lowestPrice >= ${filters.minPrice}`);
    }

    if (filters.maxPrice !== undefined) {
      parts.push(`lowestPrice <= ${filters.maxPrice}`);
    }

    if (filters.status) {
      parts.push(`status = "${filters.status}"`);
    }

    return parts.length > 0 ? parts.join(' AND ') : undefined;
  }
}

