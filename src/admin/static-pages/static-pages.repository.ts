import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { BaseRepository } from '@/common/repositories/base.repository';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { Prisma, PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';
import { MediaService } from '@/media/media.service';

import { MediaType } from '@/media/enums/media-type.enum';

export type StaticPage = Prisma.StaticPageGetPayload<{
  include: {
    translations: true;
    sections: true;
  };
}>;
@Injectable()
export class StaticPagesRepository extends BaseRepository<StaticPage> {
  protected readonly mediaConfig = {
    image: { collection: 'image', single: true, allowedTypes: [MediaType.IMAGE, MediaType.DOCUMENT] },
  };

  constructor(
    prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    mediaService: MediaService,
  ) {
    super(prisma, mediaService);
  }
  getModel() {
    return this.prisma.staticPage;
  }

  async getAllStaticPages(query: AdvancedQueryDto) {
    const where = this.buildWhereClause(query);
    return this.paginate(query, where, {
      include: {
        translations: true,
      },
    });
  }

  async getAllStticPagesWithAllSections(
    query: AdvancedQueryDto = {},
  ): Promise<StaticPage[] | PaginatedResult<StaticPage>> {
    const where = this.buildWhereClause(query);
    return this.paginate(query, where, {
      include: {
        translations: true,
        sections: true,
      },
    });
  }
  async getStaticPageByIdWithAllSections(id: number): Promise<StaticPage | null> {
    return this.findById(id, {
      include: {
        translations: true,
        sections: true,
      },
    });
  }
  async createStaticPage(data: Prisma.StaticPageCreateInput): Promise<StaticPage> {
    const rawData = data as unknown as Record<string, unknown>;
    const sections = rawData['sections'] as Record<string, unknown>[];

    if (sections && Array.isArray(sections)) {
      rawData['sections'] = {
        create: sections.map((section) => {
          const sectionTranslations = section['translations'] as Record<string, unknown>[];
          const sectionData = { ...section };
          delete sectionData['translations'];

          return {
            ...sectionData,
            translations: {
              create: sectionTranslations,
            },
          };
        }),
      };
    }

    return this.create(rawData);
  }

  async updateStaticPage(data: Prisma.StaticPageUpdateInput, id: number): Promise<StaticPage> {
    const rawData = data as unknown as Record<string, unknown>;
    const sections = rawData['sections'] as Record<string, unknown>[];

    if (sections && Array.isArray(sections)) {
      rawData['sections'] = {
        upsert: sections.map((section) => {
          const sectionId = section['id'] ? BigInt(section['id'] as string | number) : undefined;
          const sectionTranslations = section['translations'] as Record<string, unknown>[];
          const sectionData = { ...section };
          delete sectionData['translations'];
          delete sectionData['id'];

          return {
            where: { id: sectionId || BigInt(0) },
            update: {
              ...sectionData,
              translations: {
                upsert: sectionTranslations.map((t) => ({
                  where: { recordId_langId: { recordId: sectionId || BigInt(0), langId: t['langId'] as string } },
                  update: t,
                  create: t,
                })),
              },
            },
            create: {
              ...sectionData,
              translations: {
                create: sectionTranslations,
              },
            },
          };
        }),
      };
    }

    return this.update(id, rawData);
  }
  async deleteStaticPage(id: number): Promise<StaticPage> {
    return this.delete(id);
  }

  // Sections
  async createSection(
    pageId: number,
    data: Record<string, unknown>,
  ): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }>> {
    const translations = (data['translations'] as Record<string, unknown>[]) || [];
    const sectionData = { ...data };
    delete sectionData['translations'];

    return this.prisma.pageSection.create({
      data: {
        ...(sectionData as unknown as Prisma.PageSectionUncheckedCreateInput),
        staticPageId: BigInt(pageId),
        translations: {
          create: translations as Prisma.PageSectionTranslationCreateManyPageSectionInput[],
        },
      },
      include: { translations: true },
    });
  }

  async updateSection(
    id: number,
    data: Record<string, unknown>,
  ): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }>> {
    const translations = (data['translations'] as Record<string, unknown>[]) || [];
    const sectionData = { ...data };
    delete sectionData['translations'];

    return this.prisma.pageSection.update({
      where: { id: BigInt(id) },
      data: {
        ...(sectionData as unknown as Prisma.PageSectionUpdateInput),
        translations: {
          upsert: translations.map((t) => ({
            where: { recordId_langId: { recordId: BigInt(id), langId: t['langId'] as string } },
            update: t as Prisma.PageSectionTranslationUpdateInput,
            create: t as Prisma.PageSectionTranslationCreateInput,
          })),
        },
      },
      include: {
        translations: true,
      },
    });
  }

  async deleteSection(id: number | bigint): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }>> {
    return this.prisma.pageSection.delete({
      where: { id: BigInt(id) },
      include: {
        translations: true,
      },
    });
  }

  private buildWhereClause(query: AdvancedQueryDto = {}): Prisma.StaticPageWhereInput {
    const conditions: Prisma.StaticPageWhereInput[] = [];
    if (query.search) {
      const searchCondition: Prisma.StaticPageWhereInput = {
        translations: {
          some: {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { content: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
      };
      conditions.push(searchCondition);
    }
    conditions.push(this.queryBuilder.buildFiltersCondition<Prisma.StaticPageWhereInput>(query.filters!));
    return this.queryBuilder.combineWhereConditions(...conditions);
  }
}
