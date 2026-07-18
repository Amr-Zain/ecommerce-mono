import { Injectable, Inject } from '@nestjs/common';
import { FAQS_REPOSITORY, IFaqsRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientFaqsService {
  constructor(@Inject(FAQS_REPOSITORY) private readonly faqsRepo: IFaqsRepository) {}

  async findAll(langId: string = 'en') {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
    };
    return this.faqsRepo.findClientList(query, langId);
  }
}
