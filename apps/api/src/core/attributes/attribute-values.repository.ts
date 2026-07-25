import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@/prisma';
import { BaseRepository, PreparedWrite, TranslationFields } from '@/common/repositories/base.repository';
import { MediaService } from '@/media/media.service';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { AttributeValueQueryDto } from '@/common/dto/attribute-value-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { IAttributeValuesRepository } from '@/common/interfaces';

type AttributeValueType = Prisma.AttributeValueGetPayload<{
  include: { translations: true };
}>;

@Injectable()
export class AttributeValuesRepository
  extends BaseRepository<AttributeValueType>
  implements IAttributeValuesRepository
{
  protected readonly searchConfig = {
    translationFields: ['name'] satisfies TranslationFields<AttributeValueType>[],
  };

  protected readonly filterConfig = {
    attributeId: 'bigint' as const,
  };

  protected readonly defaultListInclude = {
    translations: {
      where: { langId: '__langId__' },
      take: 1,
    },
  };

  protected readonly allowedIncludes = {
    translations: true,
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, queryBuilder);
  }

  getModel() {
    return this.prisma.attributeValue;
  }

  protected prepareWrite(data: Record<string, unknown>): PreparedWrite {
    const raw = { ...data } as Record<string, unknown>;
    const attribute = raw.attribute as { connect?: { id: bigint } } | undefined;
    if (attribute?.connect?.id) {
      raw.attributeId = attribute.connect.id;
      delete raw.attribute;
    }
    return { data: raw };
  }

  async findAll(
    query: AttributeValueQueryDto,
    langId: string = 'en',
  ): Promise<PaginatedResult<AttributeValueType> | AttributeValueType[]> {
    const where = this.buildWhereClause(query, langId);

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
    });
  }

  async createValue(data: Prisma.AttributeValueCreateInput): Promise<AttributeValueType> {
    return this.create(data);
  }

  async updateValue(id: number, data: Prisma.AttributeValueUpdateInput): Promise<AttributeValueType> {
    return this.update(id, data);
  }

  async deleteValue(id: number | bigint): Promise<AttributeValueType> {
    return this.delete(id);
  }
}
