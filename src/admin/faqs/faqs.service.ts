import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@/prisma';
import { FAQS_REPOSITORY, Faq } from '@/common/interfaces';
import { FaqsRepository } from '@/core/faqs/faqs.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(@Inject(FAQS_REPOSITORY) private readonly repo: FaqsRepository) {}

  async getAllFaqs(query: AdvancedQueryDto): Promise<PaginatedResult<Faq> | Faq[]> {
    return this.repo.findAll(query);
  }

  async updateFaq(id: number, faq: UpdateFaqDto): Promise<Faq> {
    return this.repo.update(id, faq as unknown as Prisma.FaqUpdateInput);
  }

  async deleteFaq(id: number): Promise<Faq> {
    return this.repo.delete(id);
  }

  async createFaq(faq: CreateFaqDto): Promise<Faq> {
    return this.repo.create(faq as unknown as Prisma.FaqCreateInput);
  }

  async getFaqById(id: number | bigint): Promise<Faq | null> {
    return this.repo.findById(id);
  }

  async getFaqByIdWithAllTranslations(id: number | bigint): Promise<Faq | null> {
    return this.repo.findByIdWithAllTranslations(id);
  }
}
