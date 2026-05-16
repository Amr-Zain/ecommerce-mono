import { Injectable } from '@nestjs/common';
import { AttributeValuesRepository, AttributeValueType } from './attribute-values.repository';
import { AttributeValueQueryDto, CreateAttributeValueDto } from './dto/attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-dtos';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Prisma } from '@/prisma';

@Injectable()
export class AttributeValuesService {
  constructor(private readonly repo: AttributeValuesRepository) {}

  async findAll(
    query: AttributeValueQueryDto,
    lang: string,
  ): Promise<PaginatedResult<AttributeValueType> | AttributeValueType[]> {
    return this.repo.findAll(query, lang);
  }

  async findOne(id: number): Promise<AttributeValueType | null> {
    return this.repo.findByIdWithAllTranslations(id);
  }

  async create(data: CreateAttributeValueDto): Promise<AttributeValueType> {
    const { attributeId, ...rest } = data;
    return this.repo.createValue({
      ...rest,
      attribute: { connect: { id: BigInt(attributeId) } },
    } as unknown as Prisma.AttributeValueCreateInput);
  }

  async update(id: number, data: UpdateAttributeValueDto): Promise<AttributeValueType> {
    const { attributeId, ...rest } = data;

    const updateData: Prisma.AttributeValueUpdateInput = {
      ...(rest as unknown as Prisma.AttributeValueUpdateInput),
    };

    if (attributeId) {
      updateData.attribute = { connect: { id: BigInt(attributeId) } };
    }

    return this.repo.updateValue(id, updateData);
  }

  async remove(id: number): Promise<AttributeValueType> {
    return this.repo.deleteValue(id);
  }
}
