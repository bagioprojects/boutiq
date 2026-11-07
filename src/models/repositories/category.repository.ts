import { db } from '@/lib/db';

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  sort_order: number;
  is_active: number;
  parent_name?: string | null;
  children?: CategoryItem[];
}

export class CategoryRepository {
  public static getAll(): CategoryItem[] {
    const query = `
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.parent_id, 
        c.sort_order, 
        c.is_active,
        p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ORDER BY 
        CASE WHEN c.parent_id IS NULL THEN c.sort_order ELSE p.sort_order END ASC,
        c.parent_id ASC NULLS FIRST,
        c.sort_order ASC
    `;
    const rows = db.prepare(query).all() as any[];
    return rows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      slug: String(r.slug),
      parent_id: r.parent_id !== null && r.parent_id !== undefined ? Number(r.parent_id) : null,
      sort_order: Number(r.sort_order),
      is_active: Number(r.is_active),
      parent_name: r.parent_name ? String(r.parent_name) : null,
    }));
  }

  public static getRoots(): CategoryItem[] {
    const rows = db.prepare(`
      SELECT id, name, slug, parent_id, sort_order, is_active
      FROM categories 
      WHERE parent_id IS NULL 
      ORDER BY sort_order ASC
    `).all() as any[];
    return rows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      slug: String(r.slug),
      parent_id: null,
      sort_order: Number(r.sort_order),
      is_active: Number(r.is_active),
    }));
  }

  public static getSubcategories(parentId: number): CategoryItem[] {
    const rows = db.prepare(`
      SELECT id, name, slug, parent_id, sort_order, is_active
      FROM categories 
      WHERE parent_id = ? 
      ORDER BY sort_order ASC
    `).all(parentId) as any[];
    return rows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      slug: String(r.slug),
      parent_id: Number(r.parent_id),
      sort_order: Number(r.sort_order),
      is_active: Number(r.is_active),
    }));
  }

  public static getTree(): CategoryItem[] {
    const all = this.getAll();
    const map = new Map<number, CategoryItem>();
    const roots: CategoryItem[] = [];

    for (const item of all) {
      map.set(item.id, { ...item, children: [] });
    }

    for (const item of all) {
      const node = map.get(item.id)!;
      if (item.parent_id && map.has(item.parent_id)) {
        map.get(item.parent_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  public static getById(id: number): CategoryItem | null {
    const row = db.prepare(`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.parent_id, 
        c.sort_order, 
        c.is_active,
        p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = ?
    `).get(id) as any;

    if (!row) return null;
    return {
      id: Number(row.id),
      name: String(row.name),
      slug: String(row.slug),
      parent_id: row.parent_id !== null && row.parent_id !== undefined ? Number(row.parent_id) : null,
      sort_order: Number(row.sort_order),
      is_active: Number(row.is_active),
      parent_name: row.parent_name ? String(row.parent_name) : null,
    };
  }

  public static create(data: {
    name: string;
    slug: string;
    parent_id?: number | null;
    sort_order?: number;
    is_active?: number;
  }): CategoryItem {
    const parentId = data.parent_id ?? null;
    let sortOrder = data.sort_order;

    if (sortOrder === undefined || sortOrder === null) {
      const maxOrderRow = db.prepare(`
        SELECT MAX(sort_order) as max_order 
        FROM categories 
        WHERE ${parentId === null ? 'parent_id IS NULL' : 'parent_id = ?'}
      `).get(parentId === null ? undefined : parentId) as { max_order: number | null };

      sortOrder = (maxOrderRow?.max_order ?? 0) + 1;
    }

    const isActive = data.is_active ?? 1;

    const stmt = db.prepare(`
      INSERT INTO categories (name, slug, parent_id, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(data.name, data.slug, parentId, sortOrder, isActive);

    const inserted = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
    return this.getById(inserted.id)!;
  }

  public static update(
    id: number,
    data: {
      name?: string;
      slug?: string;
      parent_id?: number | null;
      sort_order?: number;
      is_active?: number;
    }
  ): CategoryItem | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const name = data.name !== undefined ? data.name : existing.name;
    const slug = data.slug !== undefined ? data.slug : existing.slug;
    const parentId = data.parent_id !== undefined ? data.parent_id : existing.parent_id;
    const sortOrder = data.sort_order !== undefined ? data.sort_order : existing.sort_order;
    const isActive = data.is_active !== undefined ? data.is_active : existing.is_active;

    db.prepare(`
      UPDATE categories
      SET name = ?, slug = ?, parent_id = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `).run(name, slug, parentId, sortOrder, isActive, id);

    return this.getById(id);
  }

  public static delete(id: number): boolean {
    const target = this.getById(id);
    if (!target) return false;

    // Alt kategorilerin parent_id'sini null yap veya sil
    db.prepare('UPDATE categories SET parent_id = NULL WHERE parent_id = ?').run(id);
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return true;
  }

  public static reorder(id: number, direction: 'up' | 'down'): boolean {
    const target = this.getById(id);
    if (!target) return false;

    // Aynı ebeveyne sahip kardeş kategorileri sırala
    const siblings = (
      target.parent_id === null
        ? db.prepare('SELECT id, sort_order FROM categories WHERE parent_id IS NULL ORDER BY sort_order ASC').all()
        : db.prepare('SELECT id, sort_order FROM categories WHERE parent_id = ? ORDER BY sort_order ASC').all(target.parent_id)
    ) as Array<{ id: number; sort_order: number }>;

    const currentIndex = siblings.findIndex((s) => s.id === id);
    if (currentIndex === -1) return false;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) {
      // Zaten en üstte veya en altta
      return false;
    }

    const currentSibling = siblings[currentIndex];
    const adjacentSibling = siblings[targetIndex];

    // Sıralamaları yer değiştir
    db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?').run(adjacentSibling.sort_order, currentSibling.id);
    db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?').run(currentSibling.sort_order, adjacentSibling.id);

    return true;
  }

  public static batchReorder(items: Array<{ id: number; sort_order: number }>): boolean {
    if (!items || items.length === 0) return false;
    const stmt = db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?');
    for (const item of items) {
      stmt.run(item.sort_order, item.id);
    }
    return true;
  }
}

