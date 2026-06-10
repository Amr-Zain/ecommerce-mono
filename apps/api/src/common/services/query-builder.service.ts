import { Injectable } from '@nestjs/common';

type FilterValue = string | number | boolean | bigint;

@Injectable()
export class QueryBuilderService {
  /**
   * Build where conditions from filters object
   */
  buildFiltersCondition<T>(filters: Record<string, FilterValue>): T {
    if (!filters || Object.keys(filters).length === 0) {
      return {} as T;
    }

    const conditions: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === '1' || value === 'true' || value === true) {
        conditions[key] = true;
      } else if (value === '0' || value === 'false' || value === false) {
        conditions[key] = false;
      } else {
        conditions[key] = value;
      }
    }

    return conditions as unknown as T;
  }

  /**
   * Build search condition for multiple fields
   */
  buildSearchCondition<T>(search: string, fields: string[]): T {
    if (!search || fields.length === 0) {
      return {} as T;
    }

    return {
      OR: fields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    } as unknown as T;
  }

  /**
   * Combine multiple where conditions
   */
  combineWhereConditions<T>(...conditions: T[]): T {
    const validConditions = conditions.filter((c) => c && Object.keys(c as object).length > 0);

    if (validConditions.length === 0) {
      return {} as T;
    }

    if (validConditions.length === 1) {
      return validConditions[0];
    }

    return {
      AND: validConditions,
    } as unknown as T;
  }
}
