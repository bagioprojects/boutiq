import type { PrismaClient } from '@prisma/client';
import type { ICacheService } from '../../../core/cache/cache.service';

export class SitemapShardService {
  private readonly MAX_URLS_PER_SHARD = 45000;
  private readonly CACHE_TTL = 3600; // 1 saat

  constructor(
    private readonly db: PrismaClient,
    private readonly cache: ICacheService,
    private readonly baseUrl: string = 'https://fkbutik.com',
  ) {}

  async generateIndexXml(): Promise<string> {
    const cached = await this.cache.get<string>('sitemap:index');
    if (cached) return cached;

    const totalProducts = await this.db.product.count({
      where: { status: 'ACTIVE', deletedAt: null },
    });
    const productShards = Math.ceil(totalProducts / this.MAX_URLS_PER_SHARD) || 1;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (let i = 1; i <= productShards; i++) {
      xml += `  <sitemap><loc>${this.baseUrl}/sitemap_products_${i}.xml</loc></sitemap>\n`;
    }
    xml += `  <sitemap><loc>${this.baseUrl}/sitemap_collections.xml</loc></sitemap>\n`;
    xml += `  <sitemap><loc>${this.baseUrl}/sitemap_pages.xml</loc></sitemap>\n`;
    xml += `</sitemapindex>`;

    await this.cache.set('sitemap:index', xml, { ttl: this.CACHE_TTL, tags: ['sitemap'] });
    return xml;
  }

  async generateProductsShardXml(shardNumber: number): Promise<string> {
    const cacheKey = `sitemap:products:${shardNumber}`;
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) return cached;

    const skip = (shardNumber - 1) * this.MAX_URLS_PER_SHARD;
    const products = await this.db.product.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { slug: true, updatedAt: true },
      skip,
      take: this.MAX_URLS_PER_SHARD,
      orderBy: { updatedAt: 'desc' },
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const p of products) {
      xml += `  <url>\n`;
      xml += `    <loc>${this.baseUrl}/urun/${p.slug}</loc>\n`;
      xml += `    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }
    xml += `</urlset>`;

    await this.cache.set(cacheKey, xml, { ttl: this.CACHE_TTL, tags: ['sitemap', 'sitemap:products'] });
    return xml;
  }
}

