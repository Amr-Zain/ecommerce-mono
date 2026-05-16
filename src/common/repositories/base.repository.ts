import { Prisma, PrismaService } from '../../prisma';
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

import { MediaService } from '../../media/media.service';
import { BadRequestException } from '@nestjs/common';

export abstract class BaseRepository<T extends { id: number | bigint }> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mediaService?: MediaService,
  ) {}

  /**
   * The Prisma model name for this repository
   */
  protected abstract readonly modelName: Prisma.ModelName;

  /**
   * The key used for media in the request payload
   */
  protected readonly mediaKey: string = 'media';

  /**
   * Whether this model only supports a single media item
   */
  protected readonly isSingleMedia: boolean = false;

  /**
   * List of allowed media types (e.g., ['image', 'video', 'pdf']).
   * If empty, all types are allowed.
   */
  protected readonly allowedMediaTypes: string[] = [];

  /**
   * Helper to convert Prisma Model Name to snake_case for media storage
   */
  protected get normalizedModelName(): string {
    return this.modelName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }

  /**
   * Whether to automatically include the media relation in queries
   */
  protected readonly hasMedia: boolean = false;

  /**
   * Helper to merge default includes (like media) into user-provided options
   */
  protected applyDefaultIncludes(options?: QueryOptions): QueryOptions {
    if (!this.hasMedia) return options || {};

    const baseOptions = options || {};

    // If user provided 'select', we can't use 'include'
    if (baseOptions.select) return baseOptions;

    return {
      ...baseOptions,
      include: {
        ...((baseOptions.include as Record<string, unknown>) || {}),
        media: {
          select: {
            uuid: true,
            isMain: true,
            path: true,
            originalName: true,
            mimeType: true,
            type: true,
            size: true,
          },
        },
      },
    } as QueryOptions;
  }

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
    const mergedOptions = this.applyDefaultIncludes(options);

    if (mergedOptions.select) {
      queryArgs.select = mergedOptions.select;
    } else if (mergedOptions.include) {
      queryArgs.include = mergedOptions.include;
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

    const mergedOptions = this.applyDefaultIncludes(options);
    const queryArgs: { where: { id: number | bigint }; select?: SelectClause; include?: IncludeClause } = {
      where: { id },
    };

    if (mergedOptions.select) {
      queryArgs.select = mergedOptions.select;
    } else if (mergedOptions.include) {
      queryArgs.include = mergedOptions.include;
    }

    return model.findUnique(queryArgs);
  }

  async findOne(where: WhereClause, options?: QueryOptions): Promise<T | null> {
    const model = this.getModel() as {
      findFirst: (args?: QueryArgs) => Promise<T | null>;
    };

    const mergedOptions = this.applyDefaultIncludes(options);
    const queryArgs: QueryArgs = { where };

    if (mergedOptions.select) {
      queryArgs.select = mergedOptions.select;
    } else if (mergedOptions.include) {
      queryArgs.include = mergedOptions.include;
    }

    return model.findFirst(queryArgs);
  }

  async findMany(where?: WhereClause, options?: QueryOptions): Promise<T[]> {
    const model = this.getModel() as {
      findMany: (args?: QueryArgs) => Promise<T[]>;
    };

    const mergedOptions = this.applyDefaultIncludes(options);
    const queryArgs: QueryArgs = { where };

    if (mergedOptions.select) {
      queryArgs.select = mergedOptions.select;
    } else if (mergedOptions.include) {
      queryArgs.include = mergedOptions.include;
    }

    return model.findMany(queryArgs);
  }

  async create(data: DataInput, options?: QueryOptions): Promise<T> {
    const model = this.getModel() as {
      create: (args: { data: DataInput; include?: IncludeClause; select?: SelectClause }) => Promise<T>;
    };

    const media = data[this.mediaKey];

    // Safely exclude media and translation keys from the scalar data
    const {
      [this.mediaKey]: _media,
      images: _images,
      image: _image,
      translations,
      ...createData
    }: Record<string, unknown> = data;

    const finalData: DataInput = { ...createData };

    if (Array.isArray(translations) && translations.length > 0) {
      finalData.translations = {
        create: translations,
      };
    }

    const mergedOptions = this.applyDefaultIncludes(options);
    const createArgs: { data: DataInput; include?: IncludeClause; select?: SelectClause } = { data: finalData };

    if (mergedOptions.select) {
      createArgs.select = mergedOptions.select;
    } else if (mergedOptions.include) {
      createArgs.include = mergedOptions.include;
    }

    const record = await model.create(createArgs);
    const recordId = record.id;
    console.log('🚀 ~ BaseRepository ~ create ~ record:', recordId, media);
    if (media && recordId) {
      await this.handleMediaAttachment(recordId, media);
    }

    return record;
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

    const media = data[this.mediaKey];

    // Safely exclude media and translation keys
    const {
      [this.mediaKey]: _media,
      images: _images,
      image: _image,
      translations,
      ...updateData
    }: Record<string, unknown> = data;

    const finalData: DataInput = { ...updateData };

    if (Array.isArray(translations) && translations.length > 0) {
      finalData.translations = {
        upsert: translations.map((t: Record<string, unknown>) => ({
          where: { recordId_langId: { recordId: BigInt(id), langId: t.langId } },
          update: t,
          create: t,
        })),
      };
    }

    const mergedOptions = this.applyDefaultIncludes(options);
    const updateArgs: {
      where: { id: number | bigint };
      data: DataInput;
      include?: IncludeClause;
      select?: SelectClause;
    } = {
      where: { id },
      data: finalData,
    };

    if (mergedOptions.select) {
      updateArgs.select = mergedOptions.select;
    } else if (mergedOptions.include) {
      updateArgs.include = mergedOptions.include;
    }

    const record = await model.update(updateArgs);

    if (media) {
      await this.handleMediaAttachment(id, media);
    }

    return record;
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

  protected async handleMediaAttachment(id: number | bigint, media: unknown) {
    if (!this.mediaService) {
      console.warn(`MediaService not provided in ${this.constructor.name}. Skipping media attachment.`);
      return;
    }

    const hashes = Array.isArray(media) ? media : [media];

    // If single media, delete old ones first
    if (this.isSingleMedia) {
      const oldMedia = await this.prisma.media.findMany({
        where: {
          model: this.normalizedModelName,
          modelId: BigInt(id),
        },
      });

      for (const m of oldMedia) {
        await this.mediaService.deleteByUuid(m.uuid);
      }
    }

    let isFirst = true;

    for (let i = 0; i < hashes.length; i++) {
      const hash = hashes[i];
      if (typeof hash !== 'string') continue;

      // Find media by hash (without model filter first to check for mismatches)
      const mediaItems = await this.prisma.media.findMany({
        where: {
          attachHash: hash,
          modelId: null,
        },
      });

      if (mediaItems.length === 0) {
        throw new BadRequestException('MEDIA_NOT_FOUND');
      }

      if (mediaItems[0].model !== this.normalizedModelName) {
        throw new BadRequestException('MEDIA_MISMATCH');
      }

      for (const item of mediaItems) {
        // Validate allowed types if specified
        if (this.allowedMediaTypes.length > 0 && !this.allowedMediaTypes.includes(item.type)) {
          console.warn(`Media type '${item.type}' is not allowed for ${this.normalizedModelName}. Skipping.`);
          continue;
        }

        await this.mediaService.attachTempMedia({
          model: this.normalizedModelName,
          attachHash: hash,
          modelId: id.toString(),
        });

        // Handle isMain for the first image
        if (isFirst) {
          await this.prisma.media.update({
            where: { id: item.id },
            data: { isMain: true },
          });
          isFirst = false;
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
}
