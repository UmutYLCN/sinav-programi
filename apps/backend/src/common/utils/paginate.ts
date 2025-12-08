import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginatedResult } from '../interfaces/paginated-result';

export async function paginate<T>(
  queryBuilder: SelectQueryBuilder<ObjectLiteral>,
  sayfa: number,
  limit: number,
): Promise<PaginatedResult<T>> {
  const [veriler, toplam] = await queryBuilder
    .take(limit)
    .skip((sayfa - 1) * limit)
    .getManyAndCount();

  return {
    veriler: veriler as T[],
    sayfa,
    limit,
    toplam,
  };
}
