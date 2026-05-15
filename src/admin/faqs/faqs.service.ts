import { Injectable } from '@nestjs/common';
import { Prisma } from '@/prisma';
import { FaqsRepository, FaqType } from './faqs.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(private readonly repo: FaqsRepository) {}

  async getAllFaqs(query: AdvancedQueryDto): Promise<PaginatedResult<FaqType> | FaqType[]> {
    return this.repo.findAll(query);
  }

  async updateFaq(id: number, faq: UpdateFaqDto): Promise<FaqType> {
    return this.repo.update(id, faq as unknown as Prisma.FaqUpdateInput);
  }

  async deleteFaq(id: number): Promise<FaqType> {
    return this.repo.delete(id);
  }

  async createFaq(faq: CreateFaqDto): Promise<FaqType> {
    return this.repo.create(faq as unknown as Prisma.FaqCreateInput);
  }

  async getFaqById(id: number | bigint): Promise<FaqType | null> {
    return this.repo.findById(id);
  }

  async getFaqByIdWithAllTranslations(id: number | bigint): Promise<FaqType | null> {
    return this.repo.findByIdWithAllTranslations(id);
  }
}
