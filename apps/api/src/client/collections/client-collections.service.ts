import { Injectable, Inject } from '@nestjs/common';
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
    return this.collectionsRepo.findAll(query, langId, {
      select: {
        id: true,
        parentId: true,
        sortOrder: true,
        translations: {
          where: { langId },
          select: { name: true, langId: true },
          take: 1,
        },
        children: {
          select: {
            id: true,
            parentId: true,
            sortOrder: true,
            translations: {
              where: { langId },
              select: { name: true, langId: true },
              take: 1,
            },
          },
          orderBy: { sortOrder: 'asc' as const },
        },
        image: true,
        _count: { select: { children: true } },
      },
    });
  }

  async findOne(id: number) {
    return this.collectionsRepo.findOneWithChildren(id);
  }
}