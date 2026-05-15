import { PrismaService } from '../../prisma';
import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { PaginationUtil } from '../utils/pagination.util';

type WhereClause = Record<string, unknown>;

type IncludeClause = Record<string, boolean | Record<string, unknown>>;

type SelectClause = Record<string, boolean>;

type QueryOptions =
  | { select: SelectClause; include?: never }
  | { include: IncludeClause; select?: never }
  | { select?: never; include?: never };

type OrderByClause = Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];

type DataInput = Record<string, unknown>;

interface QueryArgs {
  where?: WhereClause;
  orderBy?: OrderByClause;
  select?: SelectClause;
  include?: IncludeClause;
  skip?: number;
  take?: number;
}

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
  ): Promise<PaginatedResult<T> | T[]> {
    const orderBy = this.buildOrderBy(query.sort);
    const model = this.getModel() as {
      findMany: (args?: QueryArgs) => Promise<T[]>;
      count: (args?: Pick<QueryArgs, 'where'>) => Promise<number>;
    };

    const queryArgs: QueryArgs = { where, orderBy };

    if (options?.select) {
      queryArgs.select = options.select;
    } else if (options?.include) {
      queryArgs.include = options.include;
    }

    if (query.paginate === false) {
      return model.findMany(queryArgs);
    }

    const { skip, take } = PaginationUtil.getPrismaParams(query);
    queryArgs.skip = skip;
    queryArgs.take = take;

    const [data, total] = await Promise.all([model.findMany(queryArgs), model.count({ where })]);

    return PaginationUtil.createResult<T>(data, query.page || 1, query.limit || 10, total);
  }

  async findById(id: number | bigint, options?: QueryOptions): Promise<T | null> {
    const model = this.getModel() as {
      findUnique: (args: {
        where: { id: number | bigint };
        select?: SelectClause;
        include?: IncludeClause;
      }) => Promise<T | null>;
    };

    const queryArgs: { where: { id: number | bigint }; select?: SelectClause; include?: IncludeClause } = {
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
      findFirst: (args?: QueryArgs) => Promise<T | null>;
    };

    const queryArgs: QueryArgs = { where };

    if (options?.select) {
      queryArgs.select = options.select;
    } else if (options?.include) {
      queryArgs.include = options.include;
    }

    return model.findFirst(queryArgs);
  }

  async findMany(where?: WhereClause, options?: QueryOptions): Promise<T[]> {
    const model = this.getModel() as {
      findMany: (args?: QueryArgs) => Promise<T[]>;
    };

    const queryArgs: QueryArgs = { where };

    if (options?.select) {
      queryArgs.select = options.select;
    } else if (options?.include) {
      queryArgs.include = options.include;
    }

    return model.findMany(queryArgs);
  }

  async create(data: DataInput): Promise<T> {
    const model = this.getModel() as {
      create: (args: { data: DataInput }) => Promise<T>;
    };

    const { translations, ...scalarData } = data;
    const createData: DataInput = { ...scalarData };

    if (Array.isArray(translations) && translations.length > 0) {
      createData.translations = {
        create: translations,
      };
    }

    return model.create({ data: createData });
  }

  async update(id: number | bigint, data: DataInput): Promise<T> {
    const model = this.getModel() as {
      update: (args: { where: { id: number | bigint }; data: DataInput }) => Promise<T>;
    };

    const { translations, ...scalarData } = data;
    const updateData: DataInput = { ...scalarData };

    if (Array.isArray(translations) && translations.length > 0) {
      updateData.translations = {
        upsert: translations.map((t: Record<string, unknown>) => ({
          where: { recordId_langId: { recordId: BigInt(id), langId: t.langId } },
          update: t,
          create: t,
        })),
      };
    } else if (translations === undefined) {
      // If translations is not provided in the payload, don't touch it
    } else if (Array.isArray(translations) && translations.length === 0) {
      // If translations is an empty array, optionally handle it (e.g., delete all)
      // For now, we'll follow the upsert logic which does nothing for an empty array
    }

    return model.update({ where: { id }, data: updateData });
  }

  async delete(id: number | bigint): Promise<T> {
    const model = this.getModel() as {
      delete: (args: { where: { id: number | bigint } }) => Promise<T>;
    };
    return model.delete({ where: { id } });
  }

  async count(where?: WhereClause): Promise<number> {
    const model = this.getModel() as {
      count: (args?: Pick<QueryArgs, 'where'>) => Promise<number>;
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

    return Object.entries(sort).map(([field, direction]) => ({
      [field]: direction,
    }));
  }
}
