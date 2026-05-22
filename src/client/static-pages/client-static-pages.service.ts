import { Injectable, Inject } from '@nestjs/common';
import { STATIC_PAGES_REPOSITORY } from '@/common/interfaces';
import { StaticPagesRepository } from '@/core/static-pages/static-pages.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ClientStaticPagesService {
  constructor(
    @Inject(STATIC_PAGES_REPOSITORY) private readonly staticPagesRepo: StaticPagesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };
    return this.staticPagesRepo.getAllStticPagesWithAllSections(query);
  }

  async findBySlug(slug: string) {
    return this.prisma.staticPage.findUnique({
      where: { slug, isActive: true },
      include: {
        translations: true,
        sections: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            translations: true,
          },
        },
      },
    });
  }
}