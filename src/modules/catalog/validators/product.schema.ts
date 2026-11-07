import { z } from 'zod';

export const CreateProductSchema = z.object({
  title: z.string().min(1, 'Başlık boş olamaz').max(255),
  bodyHtml: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
  vendorName: z.string().max(100).optional(),
  productType: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(50).default([]),
  brandId: z.string().cuid().optional(),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  publishedAt: z.string().datetime().transform((v) => new Date(v)).nullable().optional(),
});

export const CreateVariantSchema = z.object({
  title: z.string().min(1).max(255),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  priceAmount: z.number().int().min(0),
  priceCurrency: z.string().length(3).default('TRY'),
  compareAtPriceAmount: z.number().int().min(0).optional(),
  costPerItemAmount: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  weightUnit: z.string().default('kg'),
  requiresShipping: z.boolean().default(true),
  taxable: z.boolean().default(true),
  inventoryPolicy: z.enum(['DENY', 'CONTINUE']).default('DENY'),
  option1Value: z.string().max(100).optional(),
  option2Value: z.string().max(100).optional(),
  option3Value: z.string().max(100).optional(),
  isDigital: z.boolean().default(false),
  digitalDownloadUrl: z.string().url().optional(),
});

export const MetafieldTypeEnum = z.enum([
  'SINGLE_LINE_TEXT',
  'MULTI_LINE_TEXT',
  'NUMBER_INTEGER',
  'NUMBER_DECIMAL',
  'DATE',
  'DATE_TIME',
  'TRUE_FALSE',
  'JSON',
  'COLOR',
  'URL',
  'FILE_REFERENCE',
  'PRODUCT_REFERENCE',
  'DIMENSION',
  'WEIGHT',
  'VOLUME',
  'MONEY',
]);

export const MetafieldSchema = z.object({
  namespace: z.string().min(1).max(100),
  key: z.string().min(1).max(100),
  type: MetafieldTypeEnum,
  value: z.unknown(),
  ownerType: z.enum(['Product', 'Variant', 'Collection', 'Customer', 'Order']),
  ownerId: z.string(),
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;
export type CreateVariantDTO = z.infer<typeof CreateVariantSchema>;
export type MetafieldDTO = z.infer<typeof MetafieldSchema>;

