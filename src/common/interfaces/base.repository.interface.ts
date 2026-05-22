import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';

export interface IBaseRepository<T> {
  findById(id: number | bigint, options?: Record<string, unknown>): Promise<T | null>;
  findOne(where: Record<string, unknown>, options?: Record<string, unknown>): Promise<T | null>;
  findMany(where?: Record<string, unknown>, options?: Record<string, unknown>): Promise<T[]>;
  create(data: Record<string, unknown>, options?: Record<string, unknown>): Promise<T>;
  update(id: number | bigint, data: Record<string, unknown>, options?: Record<string, unknown>): Promise<T>;
  delete(id: number | bigint): Promise<T>;
  count(where?: Record<string, unknown>): Promise<number>;
  exists(where: Record<string, unknown>): Promise<boolean>;
}