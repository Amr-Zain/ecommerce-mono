import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma';

type FilterValue = string | number | boolean;
type WhereCondition = Record<string, FilterValue | Record<string, unknown>>;

@Injectable()
export class QueryBuilderService {
  /**
   * Build where conditions from filters object
   */
  buildFiltersCondition(filters: Record<string, FilterValue>): WhereCondition {
    if (!filters || Object.keys(filters).length === 0) {
      return {};
    }

    const conditions: WhereCondition = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === '1' || value === 'true' || value === true) {
        conditions[key] = true;
      } else if (value === '0' || value === 'false' || value === false) {
        conditions[key] = false;
      } else {
        conditions[key] = value;
      }
    }

    return conditions;
  }

  /**
   * Build search condition for multiple fields
   */
  buildSearchCondition(search: string, fields: string[]): WhereCondition {
    if (!search || fields.length === 0) {
      return {};
    }

    return {
      OR: fields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      })) as unknown as FilterValue,
    };
  }

  /**
   * Combine multiple where conditions
   */
  combineWhereConditions(...conditions: WhereCondition[]): WhereCondition {
    const validConditions = conditions.filter((c) => c && Object.keys(c).length > 0);

    if (validConditions.length === 0) {
      return {};
    }

    if (validConditions.length === 1) {
      return validConditions[0];
    }

    return {
      AND: validConditions as unknown as FilterValue,
    };
  }
}
