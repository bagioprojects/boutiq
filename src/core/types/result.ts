/**
 * Result Monad - İş mantığı ve hata yönetiminde tip güvenli Result/Either deseni
 */
import type { AppError } from './errors';

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E = AppError> = { readonly ok: false; readonly error: E };
export type Result<T, E = AppError> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E = AppError>(error: E): Err<E> => ({ ok: false, error });

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

export function combineResults<T, E = AppError>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const res of results) {
    if (!res.ok) {
      return res;
    }
    values.push(res.value);
  }
  return ok(values);
}

