export interface PaginatedList<T> {
  items: T[];
  pageInfo: PageInfo;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
  totalCount?: number;
}

export function encodeCursor(id: string, sortValue?: unknown): string {
  return Buffer.from(JSON.stringify({ id, sortValue })).toString('base64url');
}

export function decodeCursor(cursor: string): { id: string; sortValue?: unknown } {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString()) as {
    id: string;
    sortValue?: unknown;
  };
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
