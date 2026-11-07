import type { PrismaClient } from '@prisma/client';
import type { ICacheService } from '../../../core/cache/cache.service';

export type RuleCondition = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'STARTS_WITH';

export interface CollectionRule {
  field: 'title' | 'type' | 'vendor' | 'tag' | 'price' | 'compare_at_price' | 'weight' | 'inventory_stock';
  relation: RuleCondition;
  value: string;
}

export interface CollectionRuleSet {
  applied: 'ALL' | 'ANY';
  rules: CollectionRule[];
}

export class SmartCollectionEvaluatorService {
  constructor(
    private readonly db: PrismaClient,
    private readonly cache: ICacheService,
  ) {}

  async evaluateAndSync(collectionId: string): Promise<{ added: number; removed: number }> {
    const collection = await this.db.collection.findUnique({
      where: { id: collectionId },
      select: { ruleSet: true },
    });

    if (!collection?.ruleSet) return { added: 0, removed: 0 };

    const ruleSet = collection.ruleSet as unknown as CollectionRuleSet;
    const matchingProductIds = await this.findMatchingProducts(ruleSet);

    const existing = await this.db.collectionProduct.findMany({
      where: { collectionId },
      select: { productId: true },
    });

    const existingIds = new Set(existing.map((e) => e.productId));
    const matchingSet = new Set(matchingProductIds);

    const toAdd = matchingProductIds.filter((id) => !existingIds.has(id));
    const toRemove = [...existingIds].filter((id) => !matchingSet.has(id));

    if (toAdd.length > 0) {
      await this.db.collectionProduct.createMany({
        data: toAdd.map((productId, i) => ({ collectionId, productId, position: i })),
        skipDuplicates: true,
      });
    }

    if (toRemove.length > 0) {
      await this.db.collectionProduct.deleteMany({
        where: { collectionId, productId: { in: toRemove } },
      });
    }

    await this.cache.invalidateByTags([`collection:${collectionId}`, 'collections']);

    return { added: toAdd.length, removed: toRemove.length };
  }

  private async findMatchingProducts(ruleSet: CollectionRuleSet): Promise<string[]> {
    const whereConditions = ruleSet.rules.map((rule) => this.ruleToWhereClause(rule));
    const where = ruleSet.applied === 'ALL'
      ? { AND: whereConditions, deletedAt: null, status: 'ACTIVE' as const }
      : { OR: whereConditions, deletedAt: null, status: 'ACTIVE' as const };

    const products = await this.db.product.findMany({
      where,
      select: { id: true },
    });

    return products.map((p) => p.id);
  }

  private ruleToWhereClause(rule: CollectionRule): object {
    const { field, relation, value } = rule;

    const fieldMap: Record<string, string> = {
      title: 'title',
      type: 'productType',
      vendor: 'vendorName',
    };

    if (field === 'tag') {
      return { tags: { has: value } };
    }

    if (field === 'price') {
      const priceVal = Math.round(parseFloat(value) * 100);
      return {
        variants: {
          some: { priceAmount: this.getNumericCondition(relation, priceVal), deletedAt: null },
        },
      };
    }

    if (field === 'inventory_stock') {
      const stockVal = parseInt(value, 10);
      return {
        variants: {
          some: { inventoryQuantity: this.getNumericCondition(relation, stockVal), deletedAt: null },
        },
      };
    }

    const dbField = fieldMap[field] ?? field;
    return { [dbField]: this.getStringCondition(relation, value) };
  }

  private getStringCondition(relation: RuleCondition, value: string): object {
    switch (relation) {
      case 'EQUALS': return { equals: value, mode: 'insensitive' };
      case 'NOT_EQUALS': return { not: { equals: value, mode: 'insensitive' } };
      case 'CONTAINS': return { contains: value, mode: 'insensitive' };
      case 'STARTS_WITH': return { startsWith: value, mode: 'insensitive' };
      default: return { equals: value };
    }
  }

  private getNumericCondition(relation: RuleCondition, value: number): object {
    switch (relation) {
      case 'EQUALS': return { equals: value };
      case 'NOT_EQUALS': return { not: value };
      case 'GREATER_THAN': return { gt: value };
      case 'LESS_THAN': return { lt: value };
      default: return { equals: value };
    }
  }
}

