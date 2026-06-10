import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { COLLECTIONS_REPOSITORY, Collection } from '@/common/interfaces';
import { CollectionsRepository } from '@/core/collections/collections.repository';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionQueryDto } from '@/common/dto/collection-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Prisma } from '@/prisma';

@Injectable()
export class CollectionsService {
  constructor(@Inject(COLLECTIONS_REPOSITORY) private readonly repo: CollectionsRepository) {}

  async create(createCollectionDto: CreateCollectionDto): Promise<Collection> {
    return this.repo.createCollection(createCollectionDto as unknown as Prisma.CollectionCreateInput);
  }

  async findAll(query: CollectionQueryDto, lang: string): Promise<PaginatedResult<Collection> | Collection[]> {
    return this.repo.findAll(query, lang);
  }

  async findOne(id: number): Promise<Collection> {
    const collection = await this.repo.findOneWithChildren(id);
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async update(id: number, updateCollectionDto: UpdateCollectionDto): Promise<Collection> {
    return this.repo.updateCollection(updateCollectionDto as unknown as Prisma.CollectionUpdateInput, id);
  }

  async remove(id: number): Promise<Collection> {
    return this.repo.deleteCollection(id);
  }
}
