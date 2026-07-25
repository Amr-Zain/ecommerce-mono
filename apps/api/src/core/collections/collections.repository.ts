import { PaginatedResult } from '@/common/dto/pagination.dto';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { MediaService } from '@/media/media.service';
import { Prisma, PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';
import { QueryOptions, TranslationFields } from '@/common/repositories/base.repository';
import { MediaAwareRepository } from '@/common/repositories/media-aware.repository';
import { CollectionQueryDto } from '@/common/dto/collection-query.dto';
import { ICollectionsRepository } from '@/common/interfaces';

type Collection = Prisma.CollectionGetPayload<{
  include: {
    translations: true;
    _count: { select: { children: true } };
  };
}> & { hasChildren?: boolean; children?: Collection[]; parent?: Collection | null; image?: unknown };

@Injectable()
export class CollectionsRepository extends MediaAwareRepository<Collection> implements ICollectionsRepository {
  protected readonly mediaModel = 'collection';
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

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, mediaService, queryBuilder);
  }

  getModel() {
    return this.prisma.collection;
  }

  async findAll(
    query: CollectionQueryDto,
    langId: string = 'en',
    options?: QueryOptions,
  ): Promise<PaginatedResult<Collection> | Collection[]> {
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

    const enriched = await this.enrichParentMedia(Array.isArray(result) ? result : result.data);

    if (Array.isArray(result)) {
      return enriched.map((item) => this.mapHasChildren(item));
    }

    result.data = enriched.map((item) => this.mapHasChildren(item));
    return result;
  }

  private async enrichParentMedia(records: Collection[]): Promise<Collection[]> {
    const parentIds: bigint[] = records
      .map((r) => r.parentId)
      .filter((id): id is bigint => id !== null);

    if (parentIds.length === 0) return records;

    const parentMediaMap = await this.mediaService.findByEntities(this.mediaModel, parentIds);

    return records.map((record) => {
      if (!record.parent) return record;
      const parentId = BigInt(record.parent.id);
      const mediaItems = parentMediaMap.get(parentId.toString()) ?? [];
      const image = mediaItems.find((m) => m.collection === 'collection') || null;
      return { ...record, parent: { ...record.parent, image } };
    });
  }

  private mapHasChildren(item: Collection & { _count?: { children: number } }): Collection {
    const { _count, ...rest } = item;
    return {
      ...(rest as Collection),
      hasChildren: (_count?.children ?? 0) > 0,
    };
  }

  async createCollection(data: Prisma.CollectionCreateInput): Promise<Collection> {
    return this.create(data);
  }

  async updateCollection(data: Prisma.CollectionUpdateInput, id: number): Promise<Collection> {
    return this.update(id, data);
  }

  async deleteCollection(id: number | bigint): Promise<Collection> {
    return this.delete(id);
  }

  async findBySlug(slug: string, langId: string = 'en'): Promise<Collection | null> {
    const collection = await this.prisma.collection.findFirst({
      where: { slug, isActive: true },
      include: {
        translations: { where: { langId }, take: 1 },
        parent: { include: { translations: { where: { langId }, take: 1 } } },
      },
    });
    if (!collection) return null;
    const merged = await this.mergeMedia(collection as unknown as Collection);
    const enriched = (await this.enrichParentMedia([merged]))[0];
    return enriched;
  }

  async findActiveDescendantIds(id: bigint): Promise<bigint[]> {
    const collection = await this.prisma.collection.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        children: {
          where: { isActive: true },
          select: {
            id: true,
            children: { where: { isActive: true }, select: { id: true } },
          },
        },
      },
    });
    if (!collection) return [];
    return [
      collection.id,
      ...collection.children.flatMap((child) => [child.id, ...child.children.map((leaf) => leaf.id)]),
    ];
  }

  async findActiveAncestors(id: bigint, langId: string = 'en'): Promise<Collection[]> {
    const collection = await this.prisma.collection.findFirst({
      where: { id, isActive: true },
      include: {
        parent: {
          include: {
            translations: { where: { langId }, take: 1 },
            parent: { include: { translations: { where: { langId }, take: 1 } } },
          },
        },
      },
    });
    if (!collection?.parent) return [];
    return [collection.parent.parent, collection.parent].filter(Boolean) as unknown as Collection[];
  }

  async findActiveTree(langId: string = 'en'): Promise<Collection[]> {
    const [collections, products] = await Promise.all([
      this.prisma.collection.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: { translations: { where: { langId }, take: 1 } },
      }),
      this.prisma.product.findMany({
        where: { isActive: true, collectionId: { not: null } },
        select: { id: true, collectionId: true },
      }),
    ]);
    const parentById = new Map(collections.map((collection) => [collection.id.toString(), collection.parentId]));
    const countById = new Map<string, number>();
    for (const product of products) {
      let collectionId = product.collectionId;
      while (collectionId) {
        const key = collectionId.toString();
        countById.set(key, (countById.get(key) ?? 0) + 1);
        collectionId = parentById.get(key) ?? null;
      }
    }
    const withCounts = collections.map((collection) => ({
      ...collection,
      _count: { products: countById.get(collection.id.toString()) ?? 0 },
    }));
    const enriched = await this.mergeMedia(withCounts as unknown as Collection[]);
    const byParent = new Map<string, Collection[]>();
    for (const item of enriched) {
      const key = item.parentId?.toString() ?? 'root';
      byParent.set(key, [...(byParent.get(key) ?? []), item]);
    }
    const attach = (item: Collection): Collection => ({
      ...item,
      children: (byParent.get(item.id.toString()) ?? []).map(attach),
    });
    return (byParent.get('root') ?? []).map(attach);
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

    const merged = await this.mergeMedia(record as unknown as Collection);
    const enriched = (await this.enrichParentMedia([merged]))[0];

    const childrenWithMedia = enriched as unknown as Collection & {
      children: (Collection & { image: unknown })[];
    };

    if (childrenWithMedia.children && childrenWithMedia.children.length > 0) {
      const childIds = childrenWithMedia.children.map((c) => BigInt(c.id));
      const mediaMap = await this.mediaService.findByEntities(this.mediaModel, childIds);

      childrenWithMedia.children = childrenWithMedia.children.map((child) => {
        const childMedia = mediaMap.get(child.id.toString()) || [];
        const image = childMedia.find((m) => m.collection === 'collection') || null;
        return { ...child, image };
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
