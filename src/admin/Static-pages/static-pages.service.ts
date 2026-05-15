import { Injectable } from '@nestjs/common';
import { StaticPagesRepository } from './static-pages.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Prisma } from '@/prisma';
import { StaticPage } from './static-pages.repository';

@Injectable()
export class StaticPageService {
  constructor(private readonly staticPagesRepository: StaticPagesRepository) {}
  async getAllStticPagesWithAllSections(
    query: AdvancedQueryDto = {},
  ): Promise<StaticPage[] | PaginatedResult<StaticPage>> {
    return this.staticPagesRepository.getAllStticPagesWithAllSections(query);
  }
  async getStaticPageByIdWithAllSections(id: number): Promise<StaticPage | null> {
    return this.staticPagesRepository.getStaticPageByIdWithAllSections(id);
  }
  async createStaticPage(staticPage: Prisma.StaticPageCreateInput): Promise<StaticPage> {
    return this.staticPagesRepository.createStaticPage(staticPage);
  }
  async updateStaticPage(staticPage: Prisma.StaticPageUpdateInput, id: number): Promise<StaticPage> {
    return this.staticPagesRepository.updateStaticPage(staticPage, id);
  }
  async deleteStaticPage(id: number): Promise<StaticPage> {
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
