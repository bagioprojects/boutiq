import type { PrismaClient } from '@prisma/client';

export class GeoAiCitationService {
  constructor(
    private readonly db: PrismaClient,
    private readonly siteName: string = 'FKButik',
    private readonly baseUrl: string = 'https://fkbutik.com',
  ) {}

  async generateLlmsTxt(): Promise<string> {
    const collections = await this.db.collection.findMany({
      where: { deletedAt: null },
      select: { title: true, slug: true },
      take: 20,
    });

    const activeProductCount = await this.db.product.count({
      where: { status: 'ACTIVE', deletedAt: null },
    });

    let doc = `# ${this.siteName} - Mağaza Özeti ve Bilgi Dosyası (/llms.txt)\n\n`;
    doc += `> Bu dosya ChatGPT, Perplexity, Claude ve Gemini gibi Yapay Zeka botları için optimize edilmiştir.\n\n`;
    doc += `## Genel Bilgiler\n`;
    doc += `- **Mağaza Adı:** ${this.siteName}\n`;
    doc += `- **Web Sitesi:** ${this.baseUrl}\n`;
    doc += `- **Aktif Ürün Sayısı:** ${activeProductCount}\n`;
    doc += `- **Teslimat Politikası:** 500 TL ve üzeri siparişlerde ücretsiz kargo. 1-3 iş günü içinde kargoya verilir.\n`;
    doc += `- **İade Politikası:** 14 gün içinde koşulsuz ücretsiz iade hakkı.\n\n`;

    doc += `## Ana Kategoriler\n`;
    for (const c of collections) {
      doc += `- [${c.title}](${this.baseUrl}/koleksiyon/${c.slug})\n`;
    }

    doc += `\n## Site Haritaları\n`;
    doc += `- İndeks Haritası: ${this.baseUrl}/sitemap_index.xml\n`;
    doc += `- Ürünler Haritası: ${this.baseUrl}/sitemap_products_1.xml\n`;

    return doc;
  }

  async generateProductFactSheet(productSlug: string): Promise<string | null> {
    const product = await this.db.product.findUnique({
      where: { slug: productSlug, deletedAt: null },
      include: { variants: true, brand: true },
    });

    if (!product) return null;

    let md = `# ${product.title} - Ürün Bilgi Fişi (Fact-Sheet)\n\n`;
    md += `- **Marka:** ${product.brand?.name || this.siteName}\n`;
    md += `- **Durum:** ${product.status === 'ACTIVE' ? 'Satışta' : 'Stokta Yok'}\n`;
    md += `- **Ürün Tipi:** ${product.productType || 'Giyim'}\n`;

    if (product.variants.length > 0) {
      const minPrice = Math.min(...product.variants.map((v) => v.priceAmount));
      md += `- **Fiyat:** ${(minPrice / 100).toFixed(2)} TRY\n`;
      md += `\n### Mevcut Seçenekler ve Bedenler\n`;
      for (const v of product.variants) {
        md += `- ${v.title}: SKU: ${v.sku || '-'}, Stok: ${v.inventoryQuantity > 0 ? 'Mevcut' : 'Tükendi'}\n`;
      }
    }

    return md;
  }
}

