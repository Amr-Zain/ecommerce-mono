import { Injectable } from '@nestjs/common';
import { AttributesRepository, AttributeType } from './attributes.repository';
import { AttributeQueryDto } from './dto/attribute.dto';
import { CreateAttributeDto } from './dto/attribute.dto';
import { UpdateAttributeDto } from './dto/update-dtos';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Prisma } from '@/prisma';

@Injectable()
export class AttributesService {
  constructor(private readonly repo: AttributesRepository) {}

  async findAll(query: AttributeQueryDto, lang: string): Promise<PaginatedResult<AttributeType> | AttributeType[]> {
    return this.repo.findAll(query, lang);
  }

  async findOne(id: number): Promise<AttributeType | null> {
    return this.repo.findByIdWithValues(id);
  }

  async create(data: CreateAttributeDto): Promise<AttributeType> {
    return this.repo.createAttribute(data as unknown as Prisma.AttributeCreateInput);
  }

  async update(id: number, data: UpdateAttributeDto): Promise<AttributeType> {
    return this.repo.updateAttribute(id, data as unknown as Prisma.AttributeUpdateInput);
  }

  async remove(id: number): Promise<AttributeType> {
    return this.repo.deleteAttribute(id);
  }
}
