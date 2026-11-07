import type { SitemapShardService } from '../services/sitemap-shard.service';

export class SitemapController {
  constructor(private readonly sitemapService: SitemapShardService) {}

  async getSitemapIndex(): Promise<{ contentType: string; xml: string }> {
    const xml = await this.sitemapService.generateIndexXml();
    return {
      contentType: 'application/xml; charset=utf-8',
      xml,
    };
  }

  async getProductsShard(shardNumber: number): Promise<{ contentType: string; xml: string }> {
    const xml = await this.sitemapService.generateProductsShardXml(shardNumber);
    return {
      contentType: 'application/xml; charset=utf-8',
      xml,
    };
  }
}

export class RobotsController {
  getRobotsTxt(baseUrl = 'https://fkbutik.com'): { contentType: string; content: string } {
    const content = `User-agent: *
Disallow: /admin/
Disallow: /hesap/
Disallow: /api/
Disallow: /checkout/
Disallow: /*?*sirala=*

User-agent: GPTBot
Allow: /
Disallow: /admin/

User-agent: Googlebot
Allow: /

Sitemap: ${baseUrl}/sitemap_index.xml
`;
    return {
      contentType: 'text/plain; charset=utf-8',
      content,
    };
  }
}

