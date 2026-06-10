import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { COLLECTIONS_REPOSITORY, ICollectionsRepository } from '@/common/interfaces';
import { CollectionQueryDto } from '@/common/dto/collection-query.dto';

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
}
