import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@/prisma';
import { BaseRepository, QueryOptions } from '@/common/repositories/base.repository';
import { MediaService } from '@/media/media.service';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { AttributeQueryDto } from '@/common/dto/attribute-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { ATTRIBUTES_REPOSITORY, IAttributesRepository } from '@/common/interfaces';

type AttributeType = Prisma.AttributeGetPayload<{
  include: { translations: true; values: { include: { translations: true } } };
}>;

@Injectable()
export class AttributesRepository extends BaseRepository<AttributeType> implements IAttributesRepository {
  constructor(
    prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    mediaService: MediaService,
  ) {
    super(prisma, mediaService);
  }

  getModel() {
    return this.prisma.attribute;
  }

  async findAll(
    query: AttributeQueryDto,
    langId: string = 'en',
    options?: QueryOptions,
  ): Promise<PaginatedResult<AttributeType> | AttributeType[]> {
    const conditions: Prisma.AttributeWhereInput[] = [];

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

    if (options?.select) {
      return this.paginate(query, where, { select: options.select });
    }

    return this.paginate(query, where, {
      include: {
        translations: {
          where: { langId },
          take: 1,
        },
      },
    });
  }

  async findByIdWithValues(id: number | bigint): Promise<AttributeType | null> {
    return this.prisma.attribute.findUnique({
      where: { id: BigInt(id) },
      include: {
        translations: true,
        values: {
          include: {
            translations: true,
          },
        },
      },
    }) as unknown as Promise<AttributeType | null>;
  }

  async createAttribute(data: Prisma.AttributeCreateInput): Promise<AttributeType> {
    return this.create(data as unknown as Record<string, unknown>);
  }

  async updateAttribute(id: number, data: Prisma.AttributeUpdateInput): Promise<AttributeType> {
    return this.update(id, data as unknown as Record<string, unknown>);
  }

  async deleteAttribute(id: number | bigint): Promise<AttributeType> {
    return this.delete(id);
  }
}