import { db } from '@/lib/db';
import { ProductEntity, ParsedProduct } from '../entities/product.entity';

export interface CreateProductInput {
  name: string;
  sku?: string;
  category: string;
  price: number;
  stock?: number;
  sizes?: string[];
  image?: string;
  badge?: string | null;
  is_active?: number;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  category?: string;
  price?: number;
  stock?: number;
  sizes?: string[];
  image?: string;
  badge?: string | null;
  is_active?: number;
}

export function normalizeTurkishText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[ıİi]/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class ProductRepository {
  public static parseEntity(entity: ProductEntity): ParsedProduct {
    let parsedSizes: string[] = ['STANDART'];
    try {
      if (typeof entity.sizes === 'string') {
        parsedSizes = JSON.parse(entity.sizes);
      }
    } catch {
      parsedSizes = ['STANDART'];
    }

    const priceNum = entity.price_num ?? Number(entity.price) ?? 0;
    const defaultImage = entity.image || '/images/default.jpg';

    return {
      id: entity.id,
      name: entity.name,
      sku: entity.sku || `SKU-${entity.id}`,
      category: entity.category || 'Genel',
      price: priceNum,
      priceFormatted: `${priceNum.toFixed(2)} ₺`,
      stock: entity.stock,
      sizes: parsedSizes,
      colorCount: entity.color_count || 1,
      hasVideo: Boolean(entity.has_video),
      hasBackInset: Boolean(entity.has_back_inset),
      image: defaultImage,
      images: [defaultImage],
      url: entity.url || `/urun/${entity.id}`,
      badge: entity.badge || null,
      isActive: Boolean(entity.is_active),
      createdAt: entity.created_at || new Date().toISOString(),
    };
  }

  public static getActiveProducts(limit: number = 20): ParsedProduct[] {
    const rows = db
      .prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC LIMIT ?')
      .all(limit) as ProductEntity[];
    return rows.map(this.parseEntity);
  }

  public static getAll(filters?: { category?: string; search?: string; activeOnly?: boolean }): ParsedProduct[] {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (filters?.activeOnly) {
      query += ' AND is_active = 1';
    }
    if (filters?.category) {
      query += ' AND category LIKE ?';
      params.push(`%${filters.category}%`);
    }
    query += ' ORDER BY id DESC';

    const rows = (db.prepare(query).all(...params) as any[]).map((r) => ({ ...r })) as ProductEntity[];
    let parsed = rows.map((r) => this.parseEntity(r));

    if (filters?.search && filters.search.trim()) {
      const normQ = normalizeTurkishText(filters.search.trim());
      const tokens = normQ.split(/\s+/).filter(Boolean);
      if (tokens.length > 0) {
        parsed = parsed.filter((p) => {
          const skuRaw = p.sku || '';
          const skuClean = skuRaw.replace(/[^a-zA-Z0-9]/g, '');
          const searchable = normalizeTurkishText(
            `${p.name} ${skuRaw} ${skuClean} ${p.category}`
          );
          return tokens.every((tok) => searchable.includes(tok));
        });
      }
    }

    return parsed;
  }

  public static getById(id: number): ParsedProduct | null {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductEntity | undefined;
    return row ? this.parseEntity(row) : null;
  }

  public static getByUrlOrSlug(urlOrSlug: string): ParsedProduct | null {
    if (!urlOrSlug) return null;
    const raw = decodeURIComponent(urlOrSlug).trim();
    const cleanSlug = raw.replace(/^\/urun\//, '').replace(/^\//, '');
    const withUrun = `/urun/${cleanSlug}`;
    const idNum = Number(cleanSlug);

    // 1. URL ile tam veya normalize edilmiş eşleşme
    let row = db.prepare(
      'SELECT * FROM products WHERE url = ? OR url = ? OR url = ?'
    ).get(raw, withUrun, cleanSlug) as ProductEntity | undefined;

    // 2. Sayısal id eşleşmesi
    if (!row && !isNaN(idNum) && idNum > 0) {
      row = db.prepare('SELECT * FROM products WHERE id = ?').get(idNum) as ProductEntity | undefined;
    }

    // 3. Kısmi URL, SKU veya Başlık eşleşmesi
    if (!row && cleanSlug) {
      row = db.prepare(
        'SELECT * FROM products WHERE url LIKE ? OR sku LIKE ? OR name LIKE ? LIMIT 1'
      ).get(`%${cleanSlug}%`, `%${cleanSlug}%`, `%${cleanSlug}%`) as ProductEntity | undefined;
    }

    return row ? this.parseEntity(row) : null;
  }

  public static getCount(): number {
    const row = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get() as { count: number };
    return row?.count || 0;
  }

  public static create(input: CreateProductInput): number {
    const sku = input.sku || `FK-${Math.floor(10000 + Math.random() * 90000)}`;
    const stock = input.stock !== undefined ? input.stock : 50;
    const isActive = input.is_active !== undefined ? input.is_active : 1;
    const image = input.image || '/images/default.jpg';
    const sizes = JSON.stringify(input.sizes || ['STANDART']);
    const priceStr = `${input.price.toFixed(2)} ₺`;
    const badge = input.badge !== undefined ? (input.badge?.trim() || null) : null;

    const stmt = db.prepare(`
      INSERT INTO products (name, sku, category, price, price_num, stock, sizes, image, badge, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(input.name, sku, input.category, priceStr, input.price, stock, sizes, image, badge, isActive);

    const inserted = db.prepare('SELECT id FROM products WHERE sku = ?').get(sku) as { id: number };
    const id = inserted.id;

    // Update url
    db.prepare('UPDATE products SET url = ? WHERE id = ?').run(`/urun/${id}`, id);
    return id;
  }

  public static update(id: number, input: UpdateProductInput): boolean {
    const existing = this.getById(id);
    if (!existing) return false;

    const name = input.name !== undefined ? input.name : existing.name;
    const category = input.category !== undefined ? input.category : existing.category;
    const price = input.price !== undefined ? input.price : existing.price;
    const stock = input.stock !== undefined ? input.stock : existing.stock;
    const isActive = input.is_active !== undefined ? input.is_active : (existing.isActive ? 1 : 0);
    const image = input.image !== undefined ? input.image : existing.image;
    const badge = input.badge !== undefined ? (input.badge?.trim() || null) : existing.badge;
    const priceStr = `${price.toFixed(2)} ₺`;

    db.prepare(`
      UPDATE products 
      SET name = ?, category = ?, price = ?, price_num = ?, stock = ?, image = ?, badge = ?, is_active = ?
      WHERE id = ?
    `).run(name, category, priceStr, price, stock, image, badge, isActive, id);

    return true;
  }

  public static delete(id: number): boolean {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return true;
  }
}
