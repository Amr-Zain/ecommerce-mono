import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@/prisma';
import { BaseRepository, TranslationFields } from '@/common/repositories/base.repository';
import { MediaService } from '@/media/media.service';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { IAttributesRepository } from '@/common/interfaces';
import { AttributeQueryDto } from '@/common/dto/attribute-query.dto';
import type { ClientAttributeView } from '@/common/interfaces/attributes.interface';

type AttributeType = Prisma.AttributeGetPayload<{
  include: { translations: true; values: { include: { translations: true } } };
}>;

@Injectable()
export class AttributesRepository extends BaseRepository<AttributeType> implements IAttributesRepository {
  protected readonly searchConfig = {
    translationFields: ['name'] satisfies TranslationFields<AttributeType>[],
  };

  protected readonly defaultListInclude = {
    translations: {
      where: { langId: '__langId__' },
      take: 1,
    },
  };

  protected readonly allowedIncludes = {
    translations: true,
    values: { include: { translations: true } },
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, queryBuilder);
  }

  getModel() {
    return this.prisma.attribute;
  }

  findClientList(query: AttributeQueryDto, langId: string): Promise<ClientAttributeView[]> {
    return this.findAll(query, langId, {
      select: {
        id: true,
        translations: { where: { langId }, select: { name: true, langId: true }, take: 1 },
        values: {
          select: {
            id: true,
            isActive: true,
            translations: { where: { langId }, select: { name: true, langId: true }, take: 1 },
          },
        },
      },
    }) as unknown as Promise<ClientAttributeView[]>;
  }

  async findByIdWithValues(id: number | bigint): Promise<AttributeType | null> {
    return this.prisma.attribute.findUnique({
      where: { id: BigInt(id) },
      include: {
        translations: true,
        values: {
          include: { translations: true },
        },
      },
    });
  }

  async createAttribute(data: Prisma.AttributeCreateInput): Promise<AttributeType> {
    return this.create(data);
  }

  async updateAttribute(id: number, data: Prisma.AttributeUpdateInput): Promise<AttributeType> {
    return this.update(id, data);
  }

  async deleteAttribute(id: number | bigint): Promise<AttributeType> {
    return this.delete(id);
  }
}
