import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Collection, COLLECTIONS_REPOSITORY, ICollectionsRepository } from '@/common/interfaces';
import { CollectionQueryDto } from '@/common/dto/collection-query.dto';

type CollectionTreeSource = Collection & {
  _count?: { products?: number };
  children?: CollectionTreeSource[];
};

export type ClientCollectionTreeItem = {
  id: bigint;
  slug: string;
  parentId: bigint | null;
  sortOrder: number;
  isActive: boolean;
  name: string;
  description: string | null;
  image: string | null;
  _count?: { products?: number };
  children: ClientCollectionTreeItem[];
};

@Injectable()
export class ClientCollectionsService {
  constructor(@Inject(COLLECTIONS_REPOSITORY) private readonly collectionsRepo: ICollectionsRepository) {}

  async findAll(langId: string = 'en', parentId?: string) {
    const query: CollectionQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
    };
    if (parentId === 'null' || parentId === undefined) {
      query.customFilter = 'collection';
    } else if (parentId) {
      query.filters = { ...query.filters, parentId };
    }
    return this.collectionsRepo.findAll(query, langId);
  }

  async findOne(id: number) {
    const collection = await this.collectionsRepo.findOneWithChildren(id);
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async findBySlug(slug: string, langId: string) {
    const collection = await this.collectionsRepo.findBySlug(slug, langId);
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async tree(langId: string): Promise<ClientCollectionTreeItem[]> {
    const collections = await this.collectionsRepo.findActiveTree(langId);
    return collections.map((collection) => this.mapTreeItem(collection));
  }

  private mapTreeItem(collection: CollectionTreeSource): ClientCollectionTreeItem {
    const translation = collection.translations?.[0];
    const image =
      collection.image && typeof collection.image === 'object' && 'path' in collection.image
        ? String(collection.image.path)
        : typeof collection.image === 'string'
          ? collection.image
          : null;

    return {
      id: collection.id,
      slug: collection.slug,
      parentId: collection.parentId,
      sortOrder: collection.sortOrder,
      isActive: collection.isActive,
      name: translation?.name ?? '',
      description: translation?.description ?? null,
      image,
      _count: collection._count,
      children: collection.children?.map((child) => this.mapTreeItem(child)) ?? [],
    };
  }
}
