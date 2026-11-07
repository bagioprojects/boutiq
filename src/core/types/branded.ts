/**
 * Branded Types - Farklı ID tiplerinin yanlışlıkla birbiri yerine kullanılmasını önler
 */
declare const __brand: unique symbol;
export type Brand<T, TBrand> = T & { readonly [__brand]: TBrand };

export type ProductId = Brand<string, 'ProductId'>;
export type VariantId = Brand<string, 'VariantId'>;
export type CollectionId = Brand<string, 'CollectionId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type CustomerId = Brand<string, 'CustomerId'>;
export type CartId = Brand<string, 'CartId'>;
export type StaffId = Brand<string, 'StaffId'>;
export type LocationId = Brand<string, 'LocationId'>;

export const toProductId = (id: string): ProductId => id as ProductId;
export const toVariantId = (id: string): VariantId => id as VariantId;
export const toCollectionId = (id: string): CollectionId => id as CollectionId;
export const toOrderId = (id: string): OrderId => id as OrderId;
export const toCustomerId = (id: string): CustomerId => id as CustomerId;
export const toCartId = (id: string): CartId => id as CartId;
export const toStaffId = (id: string): StaffId => id as StaffId;
export const toLocationId = (id: string): LocationId => id as LocationId;

