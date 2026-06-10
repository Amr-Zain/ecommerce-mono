import { PaginatedResult } from '@/common/dto/pagination.dto';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { MediaService } from '@/media/media.service';
import { Prisma, PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';
import { BaseRepository, QueryOptions, TranslationFields } from '@/common/repositories/base.repository';
import { CollectionQueryDto } from '@/common/dto/collection-query.dto';
import { ICollectionsRepository } from '@/common/interfaces';

type Collection = Prisma.CollectionGetPayload<{
  include: {
    translations: true;
    _count: { select: { children: true } };
  };
}> & { hasChildren?: boolean };

@Injectable()
export class CollectionsRepository extends BaseRepository<Collection> implements ICollectionsRepository {
  protected mediaConfig = {
    image: { collection: 'collection', single: true, allowedTypes: [MediaType.IMAGE] },
  };

  protected readonly searchConfig = {
    translationFields: ['name'] satisfies TranslationFields<Collection>[],
  };

  protected readonly allowedIncludes = {
    translations: true,
    parent: { include: { translations: true } },
    children: { include: { translations: true } },
  };

  constructor(
    prisma: PrismaService,
    queryBuilder: QueryBuilderService,
    mediaService: MediaService,
  ) {
    super(prisma, mediaService, queryBuilder);
  }

  getModel() {
    return this.prisma.collection;
  }

  async findAll(query: CollectionQueryDto, langId: string = 'en', options?: QueryOptions): Promise<PaginatedResult<Collection> | Collection[]> {
    const where = this.buildCollectionWhereClause(query, langId);
    if (options?.select) {
      return this.paginate(query, where, { select: options.select });
    }
    const result = await this.paginate(query, where, {
      include: {
        translations: {
          where: { langId },
          select: { name: true, langId: true },
          take: 1,
        },
        parent: {
          include: {
            translations: {
              where: { langId },
              select: { name: true, langId: true },
              take: 1,
            },
          },
        },
        _count: {
          select: { children: true },
        },
      },
    });

    if (Array.isArray(result)) {
      return result.map((item) => this.mapHasChildren(item));
    }

    result.data = result.data.map((item) => this.mapHasChildren(item));
    return result;
  }

  private mapHasChildren(item: Collection & { _count?: { children: number } }): Collection {
    const { _count, ...rest } = item;
    return {
      ...(rest as Collection),
      hasChildren: (_count?.children ?? 0) > 0,
    };
  }

  async createCollection(data: Prisma.CollectionCreateInput): Promise<Collection> {
    return this.create(data as unknown as Record<string, unknown>);
  }

  async updateCollection(data: Prisma.CollectionUpdateInput, id: number): Promise<Collection> {
    return this.update(id, data as unknown as Record<string, unknown>);
  }

  async deleteCollection(id: number | bigint): Promise<Collection> {
    return this.delete(id);
  }

  /**
   * Fetch a single collection with its parent + children,
   * then batch-fetch all children media in ONE extra query.
   */
  async findOneWithChildren(
    id: number,
  ): Promise<(Collection & { children: (Collection & { image: unknown })[] }) | null> {
    const record = await this.prisma.collection.findUnique({
      where: { id: BigInt(id) },
      include: {
        translations: { select: { name: true, langId: true } },
        parent: {
          include: { translations: { select: { name: true, langId: true } } },
        },
        children: {
          include: { translations: { select: { name: true, langId: true } } },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { children: true } },
      },
    });

    if (!record) return null;

    const enriched = await this.mergeMedia(record as unknown as Collection);

    const childrenWithMedia = enriched as unknown as Collection & {
      children: (Collection & { image: unknown })[];
    };

    if (childrenWithMedia.children && childrenWithMedia.children.length > 0) {
      const childIds = childrenWithMedia.children.map((c) => BigInt(c.id));
      const mediaMap = await this.mediaService!.findByEntities(this.modelName, childIds);

      childrenWithMedia.children = childrenWithMedia.children.map((child) => {
        const childMedia = mediaMap.get(child.id.toString()) || [];
        const image = childMedia.find((m) => m.collection === 'collection') || null;
        return { ...child, image } as Collection & { image: unknown };
      });
    }

    return {
      ...childrenWithMedia,
      hasChildren: ((record as unknown as { _count: { children: number } })._count?.children ?? 0) > 0,
    };
  }

  /**
   * Custom buildWhereClause because collections have special `customFilter` logic.
   */
  private buildCollectionWhereClause(query: CollectionQueryDto, langId?: string): Prisma.CollectionWhereInput {
    // Get base conditions from the generic buildWhereClause
    const baseWhere = this.buildWhereClause(query, langId) as Prisma.CollectionWhereInput;
    const conditions: Prisma.CollectionWhereInput[] = [];

    if (Object.keys(baseWhere).length > 0) {
      conditions.push(baseWhere);
    }

    // Custom hierarchy filters
    if (query.customFilter === 'collection') {
      conditions.push({ parentId: null });
    } else if (query.customFilter === 'sub_collection') {
      conditions.push({ parent: { parentId: null } });
    } else if (query.customFilter === 'sub_sub_collection' || query.customFilter === 'sub_sub_collections') {
      conditions.push({ parent: { parent: { parentId: null } } });
    }

    return this.queryBuilder!.combineWhereConditions(...conditions);
  }
}
