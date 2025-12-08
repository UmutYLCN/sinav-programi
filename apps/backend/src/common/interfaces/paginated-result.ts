export interface PaginatedResult<T> {
  veriler: T[];
  sayfa: number;
  limit: number;
  toplam: number;
}
