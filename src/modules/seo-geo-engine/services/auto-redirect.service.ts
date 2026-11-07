import type { PrismaClient } from '@prisma/client';

export class AutoRedirectService {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Slug değiştiğinde eski yoldan yeni yola 301 oluşturur.
   * Zincirleme yönlendirmeleri (A -> B ve B -> C) anında tek adıma (A -> C) indirger.
   */
  async registerRedirect(oldPath: string, newPath: string): Promise<void> {
    if (oldPath === newPath) return;

    // 1. Yeni yönlendirmeyi kaydet veya güncelle
    await this.db.urlRedirect.upsert({
      where: { fromPath: oldPath },
      update: { toPath: newPath, statusCode: 301, isActive: true },
      create: { fromPath: oldPath, toPath: newPath, statusCode: 301 },
    });

    // 2. Zincir kırıcı (Redirect Chain Flattener): Eski yola işaret eden diğer kayıtları güncelle
    // Örneğin daha önce X -> oldPath varsa, şimdi X -> newPath yap
    const chained = await this.db.urlRedirect.findMany({
      where: { toPath: oldPath },
    });

    for (const link of chained) {
      if (link.fromPath !== newPath) {
        await this.db.urlRedirect.update({
          where: { id: link.id },
          data: { toPath: newPath },
        });
      }
    }
  }

  async resolvePath(path: string): Promise<{ toPath: string; statusCode: number } | null> {
    const redirect = await this.db.urlRedirect.findUnique({
      where: { fromPath: path, isActive: true },
    });

    if (!redirect) return null;

    // Hit count artır
    await this.db.urlRedirect.update({
      where: { id: redirect.id },
      data: { hitCount: { increment: 1 } },
    });

    return { toPath: redirect.toPath, statusCode: redirect.statusCode };
  }
}

