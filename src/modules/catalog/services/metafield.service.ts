import type { PrismaClient } from '@prisma/client';
import { ok, err } from '../../../core/types/result';
import type { Result } from '../../../core/types/result';
import { ValidationError, NotFoundError } from '../../../core/types/errors';
import type { MetafieldDTO } from '../validators/product.schema';

export class MetafieldService {
  constructor(private readonly db: PrismaClient) {}

  validateValue(type: MetafieldDTO['type'], value: unknown): boolean {
    switch (type) {
      case 'SINGLE_LINE_TEXT':
      case 'MULTI_LINE_TEXT':
        return typeof value === 'string';
      case 'NUMBER_INTEGER':
        return typeof value === 'number' && Number.isInteger(value);
      case 'NUMBER_DECIMAL':
        return typeof value === 'number';
      case 'TRUE_FALSE':
        return typeof value === 'boolean';
      case 'COLOR':
        return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
      case 'URL':
        return typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
      case 'JSON':
        return typeof value === 'object' && value !== null;
      default:
        return true;
    }
  }

  async setMetafield(dto: MetafieldDTO): Promise<Result<{ id: string }>> {
    if (!this.validateValue(dto.type, dto.value)) {
      return err(new ValidationError(`Geçersiz metafield değeri: ${dto.type}`));
    }

    const ownerFieldMap: Record<string, string> = {
      Product: 'productId',
      Variant: 'variantId',
      Collection: 'collectionId',
      Customer: 'customerId',
      Order: 'orderId',
    };

    const ownerField = ownerFieldMap[dto.ownerType];
    if (!ownerField) {
      return err(new ValidationError(`Desteklenmeyen owner tipi: ${dto.ownerType}`));
    }

    const data: Record<string, unknown> = {
      namespace: dto.namespace,
      key: dto.key,
      type: dto.type,
      value: dto.value,
      [ownerField]: dto.ownerId,
    };

    const record = await this.db.metafield.upsert({
      where: {
        [`namespace_key_${ownerField}`]: {
          namespace: dto.namespace,
          key: dto.key,
          [ownerField]: dto.ownerId,
        },
      } as any,
      update: { value: dto.value as any },
      create: data as any,
    });

    return ok({ id: record.id });
  }

  async getMetafields(ownerType: string, ownerId: string) {
    const ownerFieldMap: Record<string, string> = {
      Product: 'productId',
      Variant: 'variantId',
      Collection: 'collectionId',
      Customer: 'customerId',
      Order: 'orderId',
    };

    const ownerField = ownerFieldMap[ownerType];
    if (!ownerField) return [];

    return this.db.metafield.findMany({
      where: { [ownerField]: ownerId },
    });
  }
}

