import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@/prisma';
import { BaseRepository } from '@/common/repositories/base.repository';
import { MediaService } from '@/media/media.service';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { AttributeValueQueryDto } from '@/common/dto/attribute-value-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { IAttributeValuesRepository } from '@/common/interfaces';

type AttributeValueType = Prisma.AttributeValueGetPayload<{
  include: { translations: true };
}>;

@Injectable()
export class AttributeValuesRepository extends BaseRepository<AttributeValueType> implements IAttributeValuesRepository {
  protected readonly searchConfig = {
    translationFields: ['name'],
  };

  protected readonly defaultListInclude = {
    translations: {
      where: { langId: '__langId__' },
      take: 1,
    },
  };

  constructor(
    prisma: PrismaService,
    queryBuilder: QueryBuilderService,
    mediaService: MediaService,
  ) {
    super(prisma, mediaService, queryBuilder);
  }

  getModel() {
    return this.prisma.attributeValue;
  }

  async findAll(
    query: AttributeValueQueryDto,
    langId: string = 'en',
  ): Promise<PaginatedResult<AttributeValueType> | AttributeValueType[]> {
    const conditions: Prisma.AttributeValueWhereInput[] = [];

    // Custom: filter by attributeId when provided
    if (query.filters?.attributeId) {
      conditions.push({ attributeId: BigInt(query.filters.attributeId as string) });
    }

    // Get base search/filter conditions
    const baseWhere = this.buildWhereClause(query, langId) as Prisma.AttributeValueWhereInput;
    if (Object.keys(baseWhere).length > 0) {
      conditions.push(baseWhere);
    }

    const where = this.queryBuilder!.combineWhereConditions(...conditions);

    return this.paginate(query, where, {
      include: {
        translations: {
          where: { langId },
          take: 1,
        },
      },
    });
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<AttributeValueType | null> {
    return this.prisma.attributeValue.findUnique({
      where: { id: BigInt(id) },
      include: { translations: true },
    }) as unknown as Promise<AttributeValueType | null>;
  }

  async createValue(data: Prisma.AttributeValueCreateInput): Promise<AttributeValueType> {
    return this.create(data as unknown as Record<string, unknown>);
  }

  async updateValue(id: number, data: Prisma.AttributeValueUpdateInput): Promise<AttributeValueType> {
    return this.update(id, data as unknown as Record<string, unknown>);
  }

  async deleteValue(id: number | bigint): Promise<AttributeValueType> {
    return this.delete(id);
  }
}
