import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';
import { QueryOptions } from '../../common/repositories/base.repository';

export interface StaticPageTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  title: string;
  content: string | null;
}

export interface PageSectionTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  title: string | null;
  content: string | null;
}

export interface PageSection {
  id: bigint;
  staticPageId: bigint;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations?: PageSectionTranslation[];
}

export interface StaticPage {
  id: bigint;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: StaticPageTranslation[];
  sections: PageSection[];
  image?: unknown;
}

export const STATIC_PAGES_REPOSITORY = Symbol('IStaticPagesRepository');

export interface IStaticPagesRepository extends IBaseRepository<StaticPage> {
  getAllStaticPages(query: AdvancedQueryDto): Promise<PaginatedResult<StaticPage> | StaticPage[]>;
  getAllStticPagesWithAllSections(
    query?: AdvancedQueryDto,
    options?: QueryOptions,
  ): Promise<PaginatedResult<StaticPage> | StaticPage[]>;
  getStaticPageByIdWithAllSections(id: number): Promise<StaticPage | null>;
  createStaticPage(data: unknown): Promise<StaticPage>;
  updateStaticPage(data: unknown, id: number): Promise<StaticPage>;
  deleteStaticPage(id: number): Promise<StaticPage>;
  createSection(pageId: number, data: Record<string, unknown>): Promise<PageSection | null>;
  updateSection(id: number, data: Record<string, unknown>): Promise<PageSection>;
  deleteSection(id: number | bigint): Promise<PageSection>;
}
