import { Injectable, Inject } from '@nestjs/common';
import { ATTRIBUTES_REPOSITORY, Attribute } from '@/common/interfaces';
import { AttributesRepository } from '@/core/attributes/attributes.repository';
import { AttributeQueryDto } from '@/common/dto/attribute-query.dto';
import { CreateAttributeDto } from './dto/attribute.dto';
import { UpdateAttributeDto } from './dto/update-dtos';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Prisma } from '@/prisma';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';

@Injectable()
export class AttributesService {
  constructor(
    @Inject(ATTRIBUTES_REPOSITORY) private readonly repo: AttributesRepository,
    private readonly publicCacheInvalidation: PublicCacheInvalidationPublisher,
  ) {}

  async findAll(query: AttributeQueryDto, lang: string): Promise<PaginatedResult<Attribute> | Attribute[]> {
    return this.repo.findAll(query, lang);
  }

  async findOne(id: number): Promise<Attribute> {
    return this.repo.findByIdOrThrow(id, {
      include: { translations: true, values: { include: { translations: true } } },
    });
  }

  async create(data: CreateAttributeDto): Promise<Attribute> {
    const created = await this.repo.createAttribute(data as unknown as Prisma.AttributeCreateInput);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.attributesChanged);
    return created;
  }

  async update(id: number, data: UpdateAttributeDto): Promise<Attribute> {
    const updated = await this.repo.updateAttribute(id, data as unknown as Prisma.AttributeUpdateInput);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.attributesChanged);
    return updated;
  }

  async remove(id: number): Promise<Attribute> {
    const deleted = await this.repo.deleteAttribute(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.attributesChanged);
    return deleted;
  }
}
