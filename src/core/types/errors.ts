/**
 * Hiyerarşik Uygulama Hata Tipleri
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number = 500,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} bulunamadı: ${id}`, 404, { resource, id });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly fieldErrors?: Record<string, string[]>) {
    super('VALIDATION_ERROR', message, 422, { fieldErrors });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Yetkilendirme hatası') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Erişim reddedildi') {
    super('FORBIDDEN', message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(resource: string, message: string) {
    super('CONFLICT', message, 409, { resource });
  }
}

export class InsufficientStockError extends AppError {
  constructor(variantId: string, available: number, requested: number) {
    super('INSUFFICIENT_STOCK', `Varyant (${variantId}) için yetersiz stok. Mevcut: ${available}, İstenen: ${requested}`, 409, {
      variantId,
      available,
      requested,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('RATE_LIMIT_EXCEEDED', 'Çok fazla istek yapıldı, lütfen bekleyin.', 429, { retryAfter });
  }
}

