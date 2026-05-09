import { PrismaService } from '../../prisma';
import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { PaginationUtil } from '../utils/pagination.util';

type WhereClause = Record<string, unknown>;

type IncludeClause = Record<string, boolean | unknown>;

type SelectClause = Record<string, boolean | unknown>;

type QueryOptions =
  | { select: SelectClause; include?: never }
  | { include: IncludeClause; select?: never }
  | { select?: never; include?: never };

type OrderByClause = Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];

type DataInput = Record<string, unknown>;

export abstract class BaseRepository<T> {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Get the Prisma model delegate for this repository
   * Must be implemented by child classes
   *
   * Using 'unknown' return type to allow any Prisma delegate
   * Child classes will return their specific delegate type
   */
  protected abstract getModel(): unknown;

  /**
   * Paginate results with filtering and sorting
   * If paginate=false, returns all results without pagination
   */
  protected async paginate(
    query: AdvancedQueryDto,
    where?: WhereClause,
    options?: QueryOptions,
  ): Promise<PaginatedResult<T>> {
    const orderBy = this.buildOrderBy(query.sort);
    const model = this.getModel() as {
      findMany: (args?: unknown) => Promise<T[]>;
      count: (args?: unknown) => Promise<number>;
    };

    const queryArgs: any = {
      where,
      orderBy,
    };

    if (options?.select) {
      queryArgs.select = options.select;
    } else if (options?.include) {
      queryArgs.include = options.include;
    }

    if (query.paginate === false) {
      const data = await model.findMany(queryArgs);

      return {
        data,
        meta: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    // Normal pagination
    const { skip, take } = PaginationUtil.getPrismaParams(query);
    queryArgs.skip = skip;
    queryArgs.take = take;

    const [data, total] = await Promise.all([model.findMany(queryArgs), model.count({ where })]);

    return PaginationUtil.createResult<T>(data, query.page || 1, query.limit || 10, total);
  }

  async findById(id: number | bigint, options?: QueryOptions): Promise<T | null> {
    const model = this.getModel() as {
      findUnique: (args: unknown) => Promise<T | null>;
    };

    const queryArgs: any = {
      where: { id },
    };

    if (options?.select) {
      queryArgs.select = options.select;
    } else if (options?.include) {
      queryArgs.include = options.include;
    }

    return model.findUnique(queryArgs);
  }

  async findOne(where: WhereClause, options?: QueryOptions): Promise<T | null> {
    const model = this.getModel() as {
      findFirst: (args?: unknown) => Promise<T | null>;
    };

    const queryArgs: any = {
      where,
    };

    if (options?.select) {
      queryArgs.select = options.select;
    } else if (options?.include) {
      queryArgs.include = options.include;
    }

    return model.findFirst(queryArgs);
  }

  async findMany(where?: WhereClause, options?: QueryOptions): Promise<T[]> {
    const model = this.getModel() as {
      findMany: (args?: unknown) => Promise<T[]>;
    };

    const queryArgs: any = {
      where,
    };

    if (options?.select) {
      queryArgs.select = options.select;
    } else if (options?.include) {
      queryArgs.include = options.include;
    }

    return model.findMany(queryArgs);
  }

  async create(data: DataInput): Promise<T> {
    const model = this.getModel() as {
      create: (args: unknown) => Promise<T>;
    };
    return model.create({ data });
  }

  async update(id: number | bigint, data: DataInput): Promise<T> {
    const model = this.getModel() as {
      update: (args: unknown) => Promise<T>;
    };
    return model.update({
      where: { id },
      data,
    });
  }

  async delete(id: number | bigint): Promise<T> {
    const model = this.getModel() as {
      delete: (args: unknown) => Promise<T>;
    };
    return model.delete({
      where: { id },
    });
  }

  async count(where?: WhereClause): Promise<number> {
    const model = this.getModel() as {
      count: (args?: unknown) => Promise<number>;
    };
    return model.count({ where });
  }

  async exists(where: WhereClause): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  protected buildOrderBy(sort?: Record<string, 'asc' | 'desc'>): OrderByClause {
    if (!sort || Object.keys(sort).length === 0) {
      return { createdAt: 'desc' };
    }

    // Convert sort object to array of orderBy objects
    return Object.entries(sort).map(([field, direction]) => ({
      [field]: direction,
    }));
  }
}
