import { Injectable, Inject } from '@nestjs/common';
import { FAQS_REPOSITORY, Faq } from '@/common/interfaces';
import { FaqsRepository } from '@/core/faqs/faqs.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';

@Injectable()
export class FaqsService {
  constructor(
    @Inject(FAQS_REPOSITORY) private readonly repo: FaqsRepository,
    private readonly publicCacheInvalidation: PublicCacheInvalidationPublisher,
  ) {}

  async getAllFaqs(query: AdvancedQueryDto): Promise<PaginatedResult<Faq> | Faq[]> {
    return this.repo.findAll(query);
  }

  async updateFaq(id: number, faq: UpdateFaqDto): Promise<Faq> {
    const updated = await this.repo.update(id, faq as unknown as Parameters<FaqsRepository['update']>[1]);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.faqsChanged);
    return updated;
  }

  async deleteFaq(id: number): Promise<Faq> {
    const deleted = await this.repo.delete(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.faqsChanged);
    return deleted;
  }

  async createFaq(faq: CreateFaqDto): Promise<Faq> {
    const created = await this.repo.create(faq as unknown as Parameters<FaqsRepository['create']>[0]);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.faqsChanged);
    return created;
  }

  async getFaqById(id: number | bigint): Promise<Faq> {
    return this.repo.findByIdOrThrow(id);
  }

  async getFaqByIdWithAllTranslations(id: number | bigint): Promise<Faq> {
    return this.repo.findByIdOrThrow(id, { include: { translations: true } });
  }
}
