import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService, Prisma } from '../../prisma';
import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { PaginationUtil } from '../utils/pagination.util';
import { MediaService } from '../../media/media.service';
import { MediaSlotConfig } from '../../media/media.types';
import { MediaType } from '../../media/enums/media-type.enum';
import { QueryBuilderService } from '../services/query-builder.service';

type WhereClause = Record<string, unknown>;
type IncludeClause = Record<string, boolean | Record<string, unknown>>;
type SelectClause = Record<string, boolean | Record<string, unknown>>;
type OrderByClause = Record<string, unknown> | Record<string, unknown>[];
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

// ─── Type-safe field extraction helpers ───────────────────────────────────────

/**
 * Extracts scalar (non-object) field keys from a type.
 * Used for compile-time validation of searchConfig.directFields.
 */
export type ScalarFields<T> = {
  [K in keyof T]: T[K] extends number | string | boolean | bigint | Date | null | undefined
    ? K extends string
      ? K
      : never
    : never;
}[keyof T];

/**
 * Extracts relation (object) field keys from a type.
 * Used for compile-time validation of searchConfig.relationFields and allowedIncludes.
 */
export type RelationFields<T> = {
  [K in keyof T]: T[K] extends object | null | undefined
    ? T[K] extends Date | bigint
      ? never
      : K extends string
        ? K
        : never
    : never;
}[keyof T];

/**
 * Extracts scalar field keys from the translations relation.
 * Given a model type T that has `translations: SomeTranslationType[]`,
 * this extracts the scalar fields of that translation type.
 *
 * Usage: `translationFields: ['name'] satisfies TranslationFields<City>[]`
 */
export type TranslationFields<T> = T extends { translations: (infer U)[] }
  ? ScalarFields<U>
  : T extends { translations?: (infer U)[] | null }
    ? ScalarFields<U>
    : string;

// ─── Search Config Types ──────────────────────────────────────────────────────

/** Search matching mode */
export type SearchMode = 'contains' | 'startsWith' | 'equals';

/** Explicit field descriptor with mode override */
export interface SearchFieldDescriptor {
  field: string;
  mode?: SearchMode; // defaults to 'contains'
}

/** A search field can be a plain string (defaults to 'contains') or an explicit descriptor */
export type SearchField = string | SearchFieldDescriptor;

/**
 * Describes how search should work for a relation.
 */
export interface RelationSearchField {
  /** Relation name on the model, e.g. 'user' or 'product' */
  relation: string;
  /** Fields to search within that relation */
  fields: SearchField[];
  /** If true, searches within the relation's `translations` sub-relation with langId filtering */
  isTranslation?: boolean;
}

/**
 * Declarative search configuration for a repository.
 *
 * Type-safety: Use `ScalarFields<T>` and `RelationFields<T>` in your subclass
 * to get compile-time validation of field names:
 *
 * ```typescript
 * protected readonly searchConfig = {
 *   directFields: ['name', 'email'] satisfies ScalarFields<User>[],
 *   translationFields: ['name', 'description'],
 *   relationFields: [
 *     { relation: 'user' satisfies RelationFields<Review>, fields: ['name'] },
 *   ],
 * };
 * ```
 */
export interface SearchConfig {
  /** Fields on the translations table (searched with `some` + `langId`) */
  translationFields?: SearchField[];
  /** Fields directly on the model */
  directFields?: SearchField[];
  /** Fields on related tables */
  relationFields?: RelationSearchField[];
}

// ─── Filter Config Types ──────────────────────────────────────────────────────

export type FilterFieldType = 'string' | 'number' | 'bigint' | 'boolean';

/**
 * Declares expected types for filter fields so values are auto-coerced.
 * Example: `{ countryId: 'bigint', rating: 'number', isActive: 'boolean' }`
 */
export type FilterConfig = Record<string, FilterFieldType>;

// ─── Dynamic Includes ─────────────────────────────────────────────────────────

/**
 * Maps allowed include keys (from `?include=country,reviews`) to their Prisma include clause.
 * Example: `{ country: { include: { translations: true } }, reviews: true }`
 */
export type AllowedIncludes = Record<string, boolean | Record<string, unknown>>;

export abstract class BaseRepository<T extends { id: number | bigint }> {
  protected readonly mediaConfig: Record<string, MediaSlotConfig> = {};

  /**
   * Declarative search configuration. Override in subclass.
   * Supports type-safe field names via `satisfies ScalarFields<T>[]`.
   */
  protected readonly searchConfig: SearchConfig = {};

  /**
   * Declares expected types for filter fields so they are auto-coerced
   * before being passed to Prisma. Prevents "string '5' passed to bigint field" issues.
   *
   * Example:
   * ```
   * protected readonly filterConfig: FilterConfig = {
   *   countryId: 'bigint',
   *   rating: 'number',
   *   isActive: 'boolean',
   * };
   * ```
   */
  protected readonly filterConfig: FilterConfig = {};

  /**
   * Default include clause used by `findAll()` for list views.
   * Use `'__langId__'` as a token — replaced at runtime with the actual langId.
   */
  protected readonly defaultListInclude: IncludeClause | null = null;

  /**
   * Default include clause for `findByIdWithRelations()` detail views.
   */
  protected readonly defaultDetailInclude: IncludeClause | null = null;

  /**
   * Maps allowed include keys from `?include=country,reviews` query param
   * to their Prisma include structures. Enables conditional/dynamic includes.
   *
   * Example:
   * ```
   * protected readonly allowedIncludes: AllowedIncludes = {
   *   country: { include: { translations: { where: { langId: '__langId__' } } } },
   *   reviews: true,
   * };
   * ```
   */
  protected readonly allowedIncludes: AllowedIncludes = {};

  /** Cached model name to avoid repeated Object.entries iteration */
  private _cachedModelName?: string;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mediaService?: MediaService,
    protected readonly queryBuilder?: QueryBuilderService,
  ) {}

  /**
   * Get the Prisma model delegate for this repository.
   */
  protected abstract getModel(): unknown;

  /**
   * Auto-derived Prisma model name (lowercase) used for media polymorphic lookup.
   * Cached after first access.
   */
  protected get modelName(): string {
    if (this._cachedModelName) return this._cachedModelName;

    const model = this.getModel();
    const entry = Object.entries(this.prisma).find(([_key, value]) => value === model);

    if (entry) {
      this._cachedModelName = entry[0].toLowerCase();
    } else {
      this._cachedModelName = this.constructor.name
        .replace('Repository', '')
        .toLowerCase()
        .replace(/ies$/, 'y')
        .replace(/s$/, '');
    }

    return this._cachedModelName;
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

  /**
   * Find by ID or throw NotFoundException.
   * Use this in controllers/services for GET /:id, PUT /:id, DELETE /:id endpoints.
   */
  async findByIdOrThrow(id: number | bigint, options?: QueryOptions): Promise<T> {
    const record = await this.findById(id, options);
    if (!record) {
      throw new NotFoundException(this.modelName + ' not found');
    }
    return record;
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
   * Generic findAll with search, filter, pagination, language-aware includes,
   * and dynamic includes from query.include.
   */
  async findAll(
    query: AdvancedQueryDto,
    langId: string = 'en',
    options?: QueryOptions,
  ): Promise<PaginatedResult<T> | T[]> {
    const where = this.buildWhereClause(query, langId);
    if (options?.select) {
      return this.paginate(query, where, { select: options.select });
    }
    if (options?.include) {
      return this.paginate(query, where, { include: options.include });
    }

    // Resolve default include + dynamic includes from query.include
    const include = this.resolveFullInclude(query.include, langId);
    return include ? this.paginate(query, where, { include }) : this.paginate(query, where);
  }

  /**
   * Find a single record by ID with the default detail include.
   */
  async findByIdWithRelations(id: number | bigint, langId: string = 'en'): Promise<T | null> {
    const include = this.resolveInclude(this.defaultDetailInclude, langId);
    return include ? this.findById(id, { include }) : this.findById(id);
  }

  /**
   * Find by ID with relations or throw NotFoundException.
   */
  async findByIdWithRelationsOrThrow(id: number | bigint, langId: string = 'en'): Promise<T> {
    const record = await this.findByIdWithRelations(id, langId);
    if (!record) {
      throw new NotFoundException(this.modelName + ' not found');
    }
    return record;
  }

  /**
   * Build a where clause from the query DTO using the declarative `searchConfig`.
   * Override in subclass for custom filtering logic.
   */
  protected buildWhereClause(query: AdvancedQueryDto, langId?: string): WhereClause {
    if (!this.queryBuilder) return {};

    const conditions: WhereClause[] = [];
    const filters = this.coerceFilters(query.filters ?? {});

    if (Object.keys(filters).length > 0) {
      conditions.push(this.queryBuilder.buildFiltersCondition<WhereClause>(filters));
    }

    if (query.search) {
      const searchOr: WhereClause[] = [];

      // Direct fields on the model
      for (const fieldDef of this.searchConfig.directFields ?? []) {
        const { field, mode } = this.normalizeSearchField(fieldDef);
        searchOr.push({ [field]: { [mode]: query.search, mode: 'insensitive' } });
      }

      // Translation fields (most common pattern)
      const translationFields = this.searchConfig.translationFields ?? [];
      if (translationFields.length > 0 && langId) {
        searchOr.push({
          translations: {
            some: {
              langId,
              OR: translationFields.map((fieldDef) => {
                const { field, mode } = this.normalizeSearchField(fieldDef);
                return { [field]: { [mode]: query.search, mode: 'insensitive' } };
              }),
            },
          },
        });
      }

      // Relation fields (search in related tables)
      for (const rel of this.searchConfig.relationFields ?? []) {
        if (rel.isTranslation) {
          searchOr.push({
            [rel.relation]: {
              translations: {
                some: {
                  ...(langId ? { langId } : {}),
                  OR: rel.fields.map((fieldDef) => {
                    const { field, mode } = this.normalizeSearchField(fieldDef);
                    return { [field]: { [mode]: query.search, mode: 'insensitive' } };
                  }),
                },
              },
            },
          });
        } else {
          for (const fieldDef of rel.fields) {
            const { field, mode } = this.normalizeSearchField(fieldDef);
            searchOr.push({
              [rel.relation]: { [field]: { [mode]: query.search, mode: 'insensitive' } },
            });
          }
        }
      }

      if (searchOr.length > 0) {
        conditions.push({ OR: searchOr });
      }
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────────

  /**
   * Normalizes a SearchField (string or descriptor) into { field, mode }.
   */
  private normalizeSearchField(fieldDef: SearchField): { field: string; mode: SearchMode } {
    if (typeof fieldDef === 'string') {
      return { field: fieldDef, mode: 'contains' };
    }
    return { field: fieldDef.field, mode: fieldDef.mode ?? 'contains' };
  }

  /**
   * Coerces filter values based on `filterConfig` declarations.
   * Converts string '5' to BigInt(5) for bigint fields, Number for number fields, etc.
   */
  private coerceFilters(
    filters: Record<string, string | number | boolean>,
  ): Record<string, string | number | boolean | bigint> {
    if (Object.keys(this.filterConfig).length === 0) return filters;

    const coerced: Record<string, string | number | boolean | bigint> = {};
    for (const [key, value] of Object.entries(filters)) {
      const expectedType = this.filterConfig[key];
      if (!expectedType || value === '' || value === undefined || value === null) {
        coerced[key] = value;
        continue;
      }

      switch (expectedType) {
        case 'bigint':
          coerced[key] = BigInt(value);
          break;
        case 'number':
          coerced[key] = Number(value);
          break;
        case 'boolean':
          coerced[key] = value === true || value === 'true' || value === '1';
          break;
        default:
          coerced[key] = value;
      }
    }
    return coerced;
  }

  /**
   * Merges `defaultListInclude` with dynamic includes from `query.include` (e.g. ?include=country,reviews).
   * Only allows includes declared in `allowedIncludes`.
   */
  private resolveFullInclude(requestedIncludes?: string[], langId: string = 'en'): IncludeClause | null {
    const base = this.resolveInclude(this.defaultListInclude, langId);

    if (!requestedIncludes || requestedIncludes.length === 0 || Object.keys(this.allowedIncludes).length === 0) {
      return base;
    }

    // Build dynamic include from allowed list
    const dynamicInclude: IncludeClause = {};
    for (const key of requestedIncludes) {
      const allowed = this.allowedIncludes[key];
      if (allowed !== undefined) {
        dynamicInclude[key] = allowed;
      }
    }

    if (Object.keys(dynamicInclude).length === 0) return base;

    // Resolve langId tokens in the dynamic include
    const resolvedDynamic = this.resolveInclude(dynamicInclude, langId);

    // Merge: base includes + dynamic includes
    if (!base) return resolvedDynamic;
    if (!resolvedDynamic) return base;
    return { ...base, ...resolvedDynamic };
  }

  /**
   * Resolves an include clause by recursively replacing `'__langId__'` tokens
   * with the actual langId value. Uses deep object traversal (no JSON.stringify).
   */
  private resolveInclude(include: IncludeClause | null, langId: string): IncludeClause | null {
    if (!include) return null;
    return this.deepReplace(include, '__langId__', langId) as IncludeClause;
  }

  /**
   * Recursively traverses an object/array, replacing any value === token with replacement.
   */
  private deepReplace(obj: unknown, token: string, replacement: string): unknown {
    if (obj === token) return replacement;
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return obj === token ? replacement : obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.deepReplace(item, token, replacement));

    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = this.deepReplace(v, token, replacement);
    }
    return result;
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
            await this.mediaService.attachTempMedia(
              {
                model,
                attachHash: item.attachHash,
                modelId: id.toString(),
              },
              tx,
            );
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

  /**
   * Build Prisma orderBy from sort object.
   * Supports nested relation sorting via dot-notation: `sort[country.name]=asc`
   * becomes `{ country: { name: 'asc' } }`.
   */
  protected buildOrderBy(sort?: Record<string, 'asc' | 'desc'>): OrderByClause {
    if (!sort || Object.keys(sort).length === 0) {
      return { createdAt: 'desc' };
    }

    return Object.entries(sort).map(([field, direction]) => {
      const parts = field.split('.');
      if (parts.length === 1) {
        return { [field]: direction };
      }

      // Build nested object: "country.name" → { country: { name: 'asc' } }
      let result: Record<string, unknown> = { [parts.pop()!]: direction };
      while (parts.length > 0) {
        result = { [parts.pop()!]: result };
      }
      return result;
    });
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
