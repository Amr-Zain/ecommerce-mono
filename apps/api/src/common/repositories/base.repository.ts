import { BadRequestException } from '@nestjs/common';
import { PrismaService, Prisma } from '../../prisma';
import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { PaginationUtil } from '../utils/pagination.util';
import { MediaService } from '../../media/media.service';
import { MediaSlotConfig } from '../../media/media.types';
import { MediaType } from '../../media/enums/media-type.enum';

type WhereClause = Record<string, unknown>;
type IncludeClause = Record<string, boolean | Record<string, unknown>>;
type SelectClause = Record<string, boolean | Record<string, unknown>>;
type OrderByClause = Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
type DataInput = Record<string, unknown>;

export type QueryOptions =
  | { select: SelectClause; include?: never }
  | { include: IncludeClause; select?: never }
  | { select?: never; include?: never };

export type { SelectClause, IncludeClause };

interface QueryArgs {
  where?: WhereClause;
  orderBy?: OrderByClause;
  select?: SelectClause;
  include?: IncludeClause;
  skip?: number;
  take?: number;
}

export abstract class BaseRepository<T extends { id: number | bigint }> {
  protected readonly mediaConfig: Record<string, MediaSlotConfig> = {};

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mediaService?: MediaService,
  ) {}

  /**
   * Get the Prisma model delegate for this repository.
   */
  protected abstract getModel(): unknown;

  /**
   * Auto-derived Prisma model name (lowercase) used for media polymorphic lookup.
   */
  protected get modelName(): string {
    const model = this.getModel();
    const entry = Object.entries(this.prisma).find(([_key, value]) => value === model);

    if (entry) return entry[0].toLowerCase();

    return this.constructor.name.replace('Repository', '').toLowerCase().replace(/ies$/, 'y').replace(/s$/, '');
  }

  protected get hasMedia(): boolean {
    return Object.keys(this.mediaConfig).length > 0;
  }

  /**
   * Paginate results with filtering and sorting.
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
      const data = await model.findMany(queryArgs);
      return this.mergeMedia(data);
    }

    const { skip, take } = PaginationUtil.getPrismaParams(query);
    queryArgs.skip = skip;
    queryArgs.take = take;

    const [data, total] = await Promise.all([model.findMany(queryArgs), model.count({ where })]);

    const enrichedData = await this.mergeMedia(data);

    return PaginationUtil.createResult<T>(enrichedData, query.page || 1, query.limit || 10, total);
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

    const record = await model.findUnique(queryArgs);
    return record ? this.mergeMedia(record) : null;
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

    const record = await model.findFirst(queryArgs);
    return record ? this.mergeMedia(record) : null;
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

    const data = await model.findMany(queryArgs);
    return this.mergeMedia(data);
  }

  async create(data: DataInput, options?: QueryOptions): Promise<T> {
    const model = this.getModel() as {
      create: (args: { data: DataInput; include?: IncludeClause; select?: SelectClause }) => Promise<T>;
    };

    // Extract media fields based on mediaConfig keys
    const mediaPayload: Record<string, string | string[]> = {};
    const finalData: DataInput = { ...this.normalizeDateStrings(data) };

    for (const key of Object.keys(this.mediaConfig)) {
      if (data[key] !== undefined) {
        mediaPayload[key] = data[key] as string | string[];
        delete finalData[key];
      }
    }

    // Handle translations if present
    const { translations, ...scalarData } = finalData;
    const createData: DataInput = { ...scalarData };

    if (Array.isArray(translations) && translations.length > 0) {
      createData.translations = {
        create: translations,
      };
    }

    const createArgs: { data: DataInput; include?: IncludeClause; select?: SelectClause } = { data: createData };
    if (options?.select) {
      createArgs.select = options.select;
    } else if (options?.include) {
      createArgs.include = options.include;
    }

    const record = await model.create(createArgs);

    if (this.hasMedia && Object.keys(mediaPayload).length > 0) {
      await this.handleMediaAttachment(record.id, mediaPayload);
    }

    return this.mergeMedia(record);
  }

  async update(id: number | bigint, data: DataInput, options?: QueryOptions): Promise<T> {
    const model = this.getModel() as {
      update: (args: {
        where: { id: number | bigint };
        data: DataInput;
        include?: IncludeClause;
        select?: SelectClause;
      }) => Promise<T>;
    };

    // Extract media fields
    const mediaPayload: Record<string, string | string[]> = {};
    const finalData: DataInput = { ...this.normalizeDateStrings(data) };

    for (const key of Object.keys(this.mediaConfig)) {
      if (data[key] !== undefined) {
        mediaPayload[key] = data[key] as string | string[];
        delete finalData[key];
      }
    }

    // Handle translations
    const { translations, ...scalarData } = finalData;
    const updateData: DataInput = { ...scalarData };

    if (Array.isArray(translations) && translations.length > 0) {
      updateData.translations = {
        upsert: translations.map((t: Record<string, unknown>) => ({
          where: { recordId_langId: { recordId: BigInt(id), langId: t.langId } },
          update: t,
          create: t,
        })),
      };
    }

    const updateArgs: {
      where: { id: number | bigint };
      data: DataInput;
      include?: IncludeClause;
      select?: SelectClause;
    } = {
      where: { id },
      data: updateData,
    };

    if (options?.select) {
      updateArgs.select = options.select;
    } else if (options?.include) {
      updateArgs.include = options.include;
    }

    const record = await model.update(updateArgs);

    if (this.hasMedia && Object.keys(mediaPayload).length > 0) {
      await this.handleMediaAttachment(id, mediaPayload);
    }

    return this.mergeMedia(record);
  }

  async delete(id: number | bigint): Promise<T> {
    const model = this.getModel() as {
      delete: (args: { where: { id: number | bigint } }) => Promise<T>;
    };

    // Delete associated media files and records first
    if (this.hasMedia && this.mediaService) {
      await this.mediaService.deleteByEntity(this.modelName, id);
    }

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

  /**
   * Post-fetch helper to merge media into records based on config.
   */
  protected async mergeMedia<R extends T | T[]>(data: R): Promise<R> {
    if (!this.hasMedia || !this.mediaService || !data) return data;

    const isArray = Array.isArray(data);
    const records = (isArray ? data : [data]) as T[];
    if (records.length === 0) return data;

    const ids = records.map((r) => BigInt(r.id));
    const mediaMap = await this.mediaService.findByEntities(this.modelName, ids);

    for (const record of records) {
      const entityMedia = mediaMap.get(record.id.toString()) || [];
      const enrichedRecord = record as unknown as Record<string, unknown>;

      for (const [key, config] of Object.entries(this.mediaConfig)) {
        const collectionMedia = entityMedia.filter((m) => m.collection === config.collection);

        if (config.single) {
          enrichedRecord[key] = collectionMedia.length > 0 ? collectionMedia[0] : null;
        } else {
          enrichedRecord[key] = collectionMedia;
        }
      }
    }

    return data;
  }

  protected async handleMediaAttachment(
    id: number | bigint,
    mediaPayload: Record<string, string | string[]>,
    tx?: Prisma.TransactionClient,
    modelOverride?: string,
  ) {
    if (!this.mediaService) return;

    const prisma = tx || this.prisma;
    const model = (modelOverride || this.modelName).toLowerCase();

    for (const [key, payload] of Object.entries(mediaPayload)) {
      const config = this.mediaConfig[key];
      if (!config) continue;

      const hashes = Array.isArray(payload) ? payload : [payload];
      if (hashes.length === 0) continue;

      // If single media, clean up existing for this collection
      if (config.single) {
        await this.mediaService.deleteByEntity(model, id, config.collection, tx);
      }

      for (const [index, hash] of hashes.entries()) {
        if (typeof hash !== 'string') continue;

        // Check if media exists and belongs to this model (validation)
        const mediaItems = await prisma.media.findMany({
          where: {
            OR: [
              { attachHash: hash, modelId: null },
              { attachHash: hash, modelId: BigInt(id) },
              { uuid: hash, modelId: null },
              { uuid: hash, modelId: BigInt(id) },
            ],
          },
        });

        if (mediaItems.length === 0) continue;

        if (mediaItems[0].model.toLowerCase() !== model) {
          throw new BadRequestException(`Media model mismatch. Expected ${model}, got ${mediaItems[0].model}`);
        }

        for (const item of mediaItems) {
          if (
            config.allowedTypes &&
            config.allowedTypes.length > 0 &&
            !config.allowedTypes.includes(item.type as MediaType)
          ) {
            throw new BadRequestException(
              `Media type mismatch. Expected ${config.allowedTypes.join(', ')}, got ${item.type}`,
            );
          }

          if (item.modelId === null && item.attachHash) {
            await this.mediaService.attachTempMedia({
              model,
              attachHash: item.attachHash,
              modelId: id.toString(),
            }, tx);
          }

          // Set collection and handle isMain (only for the first hash)
          await prisma.media.update({
            where: { id: item.id },
            data: {
              collection: config.collection,
              isMain: index === 0,
            },
          });
        }
      }
    }
  }

  protected buildOrderBy(sort?: Record<string, 'asc' | 'desc'>): OrderByClause {
    if (!sort || Object.keys(sort).length === 0) {
      return { createdAt: 'desc' };
    }

    return Object.entries(sort).map(([field, direction]) => ({
      [field]: direction,
    }));
  }

  /**
   * Recursively converts ISO date-only strings (YYYY-MM-DD) to Date objects
   * so Prisma DateTime fields receive proper values instead of bare strings.
   */
  private normalizeDateStrings(data: DataInput): DataInput {
    const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]*)?$/;

    const process = (value: unknown): unknown => {
      if (value === null || value === undefined) return value;
      if (value instanceof Date) return value;
      if (typeof value === 'string' && ISO_DATE_RE.test(value)) {
        const d = new Date(value);
        return isNaN(d.getTime()) ? value : d;
      }
      if (Array.isArray(value)) return value.map(process);
      if (typeof value === 'object') {
        const result: DataInput = {};
        for (const [k, v] of Object.entries(value as DataInput)) {
          result[k] = process(v);
        }
        return result;
      }
      return value;
    };

    return process(data) as DataInput;
  }
}
