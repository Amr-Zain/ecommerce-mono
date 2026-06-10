import { Injectable, Inject } from '@nestjs/common';
import { ATTRIBUTES_REPOSITORY, Attribute } from '@/common/interfaces';
import { AttributesRepository } from '@/core/attributes/attributes.repository';
import { AttributeQueryDto } from '@/common/dto/attribute-query.dto';
import { CreateAttributeDto } from './dto/attribute.dto';
import { UpdateAttributeDto } from './dto/update-dtos';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Prisma } from '@/prisma';

@Injectable()
export class AttributesService {
  constructor(@Inject(ATTRIBUTES_REPOSITORY) private readonly repo: AttributesRepository) {}

  async findAll(query: AttributeQueryDto, lang: string): Promise<PaginatedResult<Attribute> | Attribute[]> {
    return this.repo.findAll(query, lang);
  }

  async findOne(id: number): Promise<Attribute> {
    return this.repo.findByIdOrThrow(id, {
      include: { translations: true, values: { include: { translations: true } } },
    });
  }

  async create(data: CreateAttributeDto): Promise<Attribute> {
    return this.repo.createAttribute(data as unknown as Prisma.AttributeCreateInput);
  }

  async update(id: number, data: UpdateAttributeDto): Promise<Attribute> {
    return this.repo.updateAttribute(id, data as unknown as Prisma.AttributeUpdateInput);
  }

  async remove(id: number): Promise<Attribute> {
    return this.repo.deleteAttribute(id);
  }
}
