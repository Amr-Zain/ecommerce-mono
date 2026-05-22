import { Injectable, Inject } from '@nestjs/common';
import { ATTRIBUTE_VALUES_REPOSITORY, AttributeValue } from '@/common/interfaces';
import { AttributeValuesRepository } from '@/core/attributes/attribute-values.repository';
import { AttributeValueQueryDto } from '@/common/dto/attribute-value-query.dto';
import { CreateAttributeValueDto } from './dto/attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-dtos';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Prisma } from '@/prisma';

@Injectable()
export class AttributeValuesService {
  constructor(@Inject(ATTRIBUTE_VALUES_REPOSITORY) private readonly repo: AttributeValuesRepository) {}

  async findAll(
    query: AttributeValueQueryDto,
    lang: string,
  ): Promise<PaginatedResult<AttributeValue> | AttributeValue[]> {
    return this.repo.findAll(query, lang);
  }

  async findOne(id: number): Promise<AttributeValue | null> {
    return this.repo.findByIdWithAllTranslations(id);
  }

  async create(data: CreateAttributeValueDto): Promise<AttributeValue> {
    const { attributeId, ...rest } = data;
    return this.repo.createValue({
      ...rest,
      attribute: { connect: { id: BigInt(attributeId) } },
    } as unknown as Prisma.AttributeValueCreateInput);
  }

  async update(id: number, data: UpdateAttributeValueDto): Promise<AttributeValue> {
    const { attributeId, ...rest } = data;

    const updateData: Prisma.AttributeValueUpdateInput = {
      ...(rest as unknown as Prisma.AttributeValueUpdateInput),
    };

    if (attributeId) {
      updateData.attribute = { connect: { id: BigInt(attributeId) } };
    }

    return this.repo.updateValue(id, updateData);
  }

  async remove(id: number): Promise<AttributeValue> {
    return this.repo.deleteValue(id);
  }
}
