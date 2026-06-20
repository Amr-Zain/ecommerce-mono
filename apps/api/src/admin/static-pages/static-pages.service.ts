import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { STATIC_PAGES_REPOSITORY, StaticPage as StaticPageInterface } from '@/common/interfaces';
import { StaticPagesRepository } from '@/core/static-pages/static-pages.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Prisma } from '@/prisma';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';

@Injectable()
export class StaticPageService {
  constructor(
    @Inject(STATIC_PAGES_REPOSITORY) private readonly staticPagesRepository: StaticPagesRepository,
    private readonly publicCacheInvalidation: PublicCacheInvalidationPublisher,
  ) {}
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
    const created = await this.staticPagesRepository.createStaticPage(staticPage);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.staticPagesChanged);
    return created;
  }
  async updateStaticPage(staticPage: Prisma.StaticPageUpdateInput, id: number): Promise<StaticPageInterface> {
    const updated = await this.staticPagesRepository.updateStaticPage(staticPage, id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.staticPagesChanged);
    return updated;
  }
  async deleteStaticPage(id: number): Promise<StaticPageInterface> {
    const deleted = await this.staticPagesRepository.deleteStaticPage(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.staticPagesChanged);
    return deleted;
  }
  async createSection(
    pageId: number,
    section: Prisma.PageSectionCreateInput,
  ): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }> | null> {
    const created = await this.staticPagesRepository.createSection(pageId, section);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.staticPagesChanged);
    return created;
  }
  async updateSection(
    section: Prisma.PageSectionUpdateInput,
    id: number,
  ): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }>> {
    const updated = await this.staticPagesRepository.updateSection(id, section);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.staticPagesChanged);
    return updated;
  }
  async deleteSection(id: number): Promise<Prisma.PageSectionGetPayload<{ include: { translations: true } }>> {
    const deleted = await this.staticPagesRepository.deleteSection(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.staticPagesChanged);
    return deleted;
  }
}
