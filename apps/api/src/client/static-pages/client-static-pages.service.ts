import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { STATIC_PAGES_REPOSITORY, IStaticPagesRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ClientStaticPagesService {
  constructor(
    @Inject(STATIC_PAGES_REPOSITORY) private readonly staticPagesRepo: IStaticPagesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(langId: string = 'en') {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };
    return this.staticPagesRepo.getAllStticPagesWithAllSections(query, {
      select: {
        id: true,
        slug: true,
        translations: {
          where: { langId },
          select: { title: true, content: true, langId: true },
        },
        sections: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' as const },
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
    });
  }

  async findBySlug(slug: string, langId: string = 'en') {
    const page = await this.prisma.staticPage.findUnique({
      where: { slug, isActive: true },
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
    });
    if (!page) throw new NotFoundException('Static page not found');
    return page;
  }
}