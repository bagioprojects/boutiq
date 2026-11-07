import type { Result } from '../types/result';
import type { AppError } from '../types/errors';

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

export abstract class BaseController {
  protected ok<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
    return {
      ok: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  protected created<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
    return this.ok(data, meta);
  }

  protected handleError(error: AppError): ApiResponse<never> {
    return {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.metadata,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  protected handleResult<T>(result: Result<T>): ApiResponse<T> {
    if (result.ok) {
      return this.ok(result.value);
    }
    return this.handleError(result.error);
  }
}

