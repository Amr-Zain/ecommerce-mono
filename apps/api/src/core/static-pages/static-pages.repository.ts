import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { BaseRepository, QueryOptions, TranslationFields } from '@/common/repositories/base.repository';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { Prisma, PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';
import { MediaService } from '@/media/media.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { IStaticPagesRepository } from '@/common/interfaces';

type StaticPage = Prisma.StaticPageGetPayload<{
  include: {
    translations: true;
    sections: true;
  };
}>;

const PAGE_SECTION_MEDIA_MODEL = 'pagesection';

@Injectable()
export class StaticPagesRepository extends BaseRepository<StaticPage> implements IStaticPagesRepository {
  protected readonly mediaConfig = {
    image: { collection: 'image', single: true, allowedTypes: [MediaType.IMAGE, MediaType.DOCUMENT] },
  };

  protected readonly searchConfig = {
    translationFields: ['title', 'content'] satisfies TranslationFields<StaticPage>[],
  };

  protected readonly defaultListInclude = {
    translations: true,
  };

  protected readonly allowedIncludes = {
    translations: true,
    sections: { include: { translations: true } },
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, mediaService, queryBuilder);
  }

  getModel() {
    return this.prisma.staticPage;
  }

  async getAllStaticPages(query: AdvancedQueryDto) {
    return this.findAll(query);
  }

  async getAllStticPagesWithAllSections(
    query: AdvancedQueryDto = {},
    options?: QueryOptions,
  ): Promise<StaticPage[] | PaginatedResult<StaticPage>> {
    const where = this.buildWhereClause(query);
    if (options?.select) {
      return this.mergeSectionMedia(await this.paginate(query, where, { select: options.select }));
    }
    return this.mergeSectionMedia(
      await this.paginate(query, where, {
        include: {
          translations: true,
          sections: { include: { translations: true }, orderBy: { sortOrder: 'asc' } },
        },
      }),
    );
  }

  async getStaticPageByIdWithAllSections(id: number): Promise<StaticPage | null> {
    return this.mergeSectionMedia(
      await this.findById(id, {
        include: {
          translations: true,
          sections: { include: { translations: true }, orderBy: { sortOrder: 'asc' } },
        },
      }),
    );
  }

  async findActiveBySlugWithSections(slug: string, langId: string = 'en'): Promise<StaticPage | null> {
    return this.mergeSectionMedia(
      await this.findOne(
        { slug, isActive: true },
        {
          select: {
            id: true,
            slug: true,
            translations: {
              where: { langId },
              select: { title: true, content: true, langId: true },
            },
            sections: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                sortOrder: true,
                translations: {
                  where: { langId },
                  select: { title: true, content: true, langId: true },
                },
              },
            },
          },
        },
      ),
    );
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
          delete sectionData['image'];

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
          delete sectionData['image'];

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

  async createSection(
    pageId: number,
    data: Record<string, unknown>,
  ): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }>> {
    const translations = (data['translations'] as Record<string, unknown>[]) || [];
    const sectionData = { ...data };
    const image = sectionData['image'] as string | undefined;
    delete sectionData['translations'];
    delete sectionData['image'];

    const section = await this.prisma.pageSection.create({
      data: {
        ...(sectionData as unknown as Prisma.PageSectionUncheckedCreateInput),
        staticPageId: BigInt(pageId),
        translations: {
          create: translations as Prisma.PageSectionTranslationCreateManyPageSectionInput[],
        },
      },
      include: { translations: true },
    });

    if (image) {
      await this.handleMediaAttachment(section.id, { image }, undefined, PAGE_SECTION_MEDIA_MODEL);
    }

    return this.mergeSectionMedia(section);
  }

  async updateSection(
    id: number,
    data: Record<string, unknown>,
  ): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }>> {
    const translations = (data['translations'] as Record<string, unknown>[]) || [];
    const sectionData = { ...data };
    const image = sectionData['image'] as string | undefined;
    delete sectionData['translations'];
    delete sectionData['image'];

    const section = await this.prisma.pageSection.update({
      where: { id: BigInt(id) },
      data: {
        ...(sectionData as unknown as Prisma.PageSectionUpdateInput),
        translations: {
          upsert: translations.map((t) => ({
            where: { recordId_langId: { recordId: BigInt(id), langId: t['langId'] as string } },
            update: t,
            create: t as Prisma.PageSectionTranslationCreateInput,
          })),
        },
      },
      include: {
        translations: true,
      },
    });

    if (image) {
      await this.handleMediaAttachment(BigInt(id), { image }, undefined, PAGE_SECTION_MEDIA_MODEL);
    }

    return this.mergeSectionMedia(section);
  }

  async deleteSection(id: number | bigint): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }>> {
    if (this.mediaService) {
      await this.mediaService.deleteByEntity(PAGE_SECTION_MEDIA_MODEL, id, 'image');
    }
    return this.prisma.pageSection.delete({
      where: { id: BigInt(id) },
      include: {
        translations: true,
      },
    });
  }

  private async mergeSectionMedia<T>(result: T): Promise<T> {
    if (!this.mediaService || !result) return result;

    const pages = this.extractPages(result);
    const sections = pages.flatMap((page) => {
      const pageSections = (page as { sections?: unknown }).sections;
      return Array.isArray(pageSections) ? pageSections : [];
    });

    const directSection = this.isSectionLike(result) ? [result as Record<string, unknown>] : [];
    const allSections = [...sections, ...directSection] as Record<string, unknown>[];
    const sectionIds = allSections
      .map((section) => section.id)
      .filter((id): id is string | number | bigint => id !== undefined && id !== null)
      .map((id) => BigInt(id));

    if (sectionIds.length === 0) return result;

    const mediaMap = await this.mediaService.findByEntities(PAGE_SECTION_MEDIA_MODEL, sectionIds);
    for (const section of allSections) {
      const id = section.id;
      if (id === undefined || id === null) continue;
      const media = mediaMap.get(String(id)) ?? [];
      section.image = media.find((item) => item.collection === 'image') ?? null;
    }

    return result;
  }

  private extractPages(result: unknown): Record<string, unknown>[] {
    if (!result || typeof result !== 'object') return [];
    if (Array.isArray(result))
      return result.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
    const data = (result as { data?: unknown }).data;
    if (Array.isArray(data))
      return data.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
    if ('sections' in (result as Record<string, unknown>)) return [result as Record<string, unknown>];
    return [];
  }

  private isSectionLike(result: unknown): result is Record<string, unknown> {
    return !!result && typeof result === 'object' && 'staticPageId' in (result as Record<string, unknown>);
  }
}
