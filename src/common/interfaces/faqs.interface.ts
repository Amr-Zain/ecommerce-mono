import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';

export interface FaqTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  question: string;
  answer: string;
}

export interface Faq {
  id: bigint;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: FaqTranslation[];
}

export const FAQS_REPOSITORY = Symbol('IFaqsRepository');

export interface IFaqsRepository extends IBaseRepository<Faq> {
  findAll(query: AdvancedQueryDto, langId?: string): Promise<PaginatedResult<Faq> | Faq[]>;
  findByIdWithAllTranslations(id: number | bigint): Promise<Faq | null>;
}