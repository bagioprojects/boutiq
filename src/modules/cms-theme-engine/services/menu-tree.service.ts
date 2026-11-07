import type { PrismaClient } from '@prisma/client';

export interface MenuItemNode {
  id: string;
  title: string;
  url: string;
  position: number;
  children: MenuItemNode[];
}

export class MenuTreeService {
  constructor(private readonly db: PrismaClient) {}

  async getMenuByHandle(handle: string): Promise<MenuItemNode[]> {
    const menu = await this.db.navigationMenu.findUnique({
      where: { handle },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!menu) return [];

    const itemMap = new Map<string, MenuItemNode>();
    const roots: MenuItemNode[] = [];

    for (const item of menu.items) {
      itemMap.set(item.id, {
        id: item.id,
        title: item.title,
        url: item.url,
        position: item.position,
        children: [],
      });
    }

    for (const item of menu.items) {
      const node = itemMap.get(item.id)!;
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}

