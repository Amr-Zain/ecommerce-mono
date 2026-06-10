import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { STATIC_PAGES_REPOSITORY, StaticPage as StaticPageInterface } from '@/common/interfaces';
import { StaticPagesRepository } from '@/core/static-pages/static-pages.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Prisma } from '@/prisma';

@Injectable()
export class StaticPageService {
  constructor(@Inject(STATIC_PAGES_REPOSITORY) private readonly staticPagesRepository: StaticPagesRepository) {}
  async getAllStticPagesWithAllSections(
    query: AdvancedQueryDto = {},
  ): Promise<StaticPageInterface[] | PaginatedResult<StaticPageInterface>> {
    return this.staticPagesRepository.getAllStticPagesWithAllSections(query);
  }
  async getStaticPageByIdWithAllSections(id: number): Promise<StaticPageInterface> {
    const page = await this.staticPagesRepository.getStaticPageByIdWithAllSections(id);
    if (!page) throw new NotFoundException('Static page not found');
    return page;
  }
  async createStaticPage(staticPage: Prisma.StaticPageCreateInput): Promise<StaticPageInterface> {
    return this.staticPagesRepository.createStaticPage(staticPage);
  }
  async updateStaticPage(staticPage: Prisma.StaticPageUpdateInput, id: number): Promise<StaticPageInterface> {
    return this.staticPagesRepository.updateStaticPage(staticPage, id);
  }
  async deleteStaticPage(id: number): Promise<StaticPageInterface> {
    return this.staticPagesRepository.deleteStaticPage(id);
  }
  async createSection(
    pageId: number,
    section: Prisma.PageSectionCreateInput,
  ): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }> | null> {
    return this.staticPagesRepository.createSection(pageId, section);
  }
  async updateSection(
    section: Prisma.PageSectionUpdateInput,
    id: number,
  ): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }>> {
    return this.staticPagesRepository.updateSection(id, section);
  }
  async deleteSection(id: number): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }>> {
    return this.staticPagesRepository.deleteSection(id);
  }
}
