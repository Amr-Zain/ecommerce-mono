import { Injectable, Inject } from '@nestjs/common';
import { COLLECTIONS_REPOSITORY } from '@/common/interfaces';
import { CollectionsRepository } from '@/core/collections/collections.repository';
import { CollectionQueryDto } from '@/admin/collections/dto/collection-query.dto';

@Injectable()
export class ClientCollectionsService {
  constructor(@Inject(COLLECTIONS_REPOSITORY) private readonly collectionsRepo: CollectionsRepository) {}

  async findAll(parentId?: string) {
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
    return this.collectionsRepo.findAll(query, 'en');
  }

  async findOne(id: number) {
    return this.collectionsRepo.findOneWithChildren(id);
  }
}