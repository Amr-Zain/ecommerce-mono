import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@/prisma';
import { BaseRepository } from '@/common/repositories/base.repository';
import { MediaService } from '@/media/media.service';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { AttributeValueQueryDto } from './dto/attribute-value.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';

export type AttributeValueType = Prisma.AttributeValueGetPayload<{
  include: { translations: true };
}>;

@Injectable()
export class AttributeValuesRepository extends BaseRepository<AttributeValueType> {
  constructor(
    prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    mediaService: MediaService,
  ) {
    super(prisma, mediaService);
  }

  getModel() {
    return this.prisma.attributeValue;
  }

  async findAll(
    query: AttributeValueQueryDto,
    langId: string = 'en',
  ): Promise<PaginatedResult<AttributeValueType> | AttributeValueType[]> {
    const conditions: Prisma.AttributeValueWhereInput[] = [];

    if (query.filters?.attributeId) {
      conditions.push({ attributeId: BigInt(query.filters.attributeId as string) });
    }

    if (query.search && langId) {
      conditions.push({
        translations: {
          some: {
            langId,
            name: { contains: query.search, mode: 'insensitive' },
          },
        },
      });
    }

    const where = this.queryBuilder.combineWhereConditions(...conditions);

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
      include: {
        translations: true,
      },
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
