import { Injectable, Inject } from '@nestjs/common';
import { FAQS_REPOSITORY } from '@/common/interfaces';
import { FaqsRepository } from '@/core/faqs/faqs.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientFaqsService {
  constructor(@Inject(FAQS_REPOSITORY) private readonly faqsRepo: FaqsRepository) {}

  async findAll() {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
    };
    return this.faqsRepo.findAll(query);
  }
}