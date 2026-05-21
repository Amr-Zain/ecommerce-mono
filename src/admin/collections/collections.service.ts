import { Injectable } from '@nestjs/common';
import { CollectionsRepository, Collection } from './collections.repository';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionQueryDto } from './dto/collection-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Prisma } from '@/prisma';

@Injectable()
export class CollectionsService {
  constructor(private readonly repo: CollectionsRepository) {}

  async create(createCollectionDto: CreateCollectionDto): Promise<Collection> {
    return this.repo.createCollection(createCollectionDto as unknown as Prisma.CollectionCreateInput);
  }

  async findAll(query: CollectionQueryDto, lang: string): Promise<PaginatedResult<Collection> | Collection[]> {
    return this.repo.findAll(query, lang);
  }

  async findOne(id: number): Promise<Collection | null> {
    return this.repo.findOneWithChildren(id);
  }

  async update(id: number, updateCollectionDto: UpdateCollectionDto): Promise<Collection> {
    return this.repo.updateCollection(updateCollectionDto as unknown as Prisma.CollectionUpdateInput, id);
  }

  async remove(id: number): Promise<Collection> {
    return this.repo.deleteCollection(id);
  }
}
