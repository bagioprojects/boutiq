import type { PrismaClient } from '@prisma/client';

export interface CategoryNode {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  sortKey: number;
  children: CategoryNode[];
}

export class CategoryTreeService {
  constructor(private readonly db: PrismaClient) {}

  async getTree(): Promise<CategoryNode[]> {
    const collections = await this.db.collection.findMany({
      where: { deletedAt: null },
      orderBy: { sortKey: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        parentId: true,
        sortKey: true,
      },
    });

    const map = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    for (const c of collections) {
      map.set(c.id, {
        id: c.id,
        title: c.title,
        slug: c.slug,
        parentId: c.parentId,
        sortKey: c.sortKey,
        children: [],
      });
    }

    for (const c of collections) {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async getBreadcrumbs(collectionId: string): Promise<Array<{ id: string; title: string; slug: string }>> {
    const breadcrumbs: Array<{ id: string; title: string; slug: string }> = [];
    let currentId: string | null = collectionId;

    while (currentId) {
      const collection = await this.db.collection.findUnique({
        where: { id: currentId },
        select: { id: true, title: true, slug: true, parentId: true },
      });

      if (!collection) break;

      breadcrumbs.unshift({
        id: collection.id,
        title: collection.title,
        slug: collection.slug,
      });

      currentId = collection.parentId;
    }

    return breadcrumbs;
  }
}

