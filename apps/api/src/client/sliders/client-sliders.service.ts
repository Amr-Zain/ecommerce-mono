import { Injectable, Inject } from '@nestjs/common';
import { SLIDERS_REPOSITORY, ISlidersRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientSlidersService {
  constructor(@Inject(SLIDERS_REPOSITORY) private readonly slidersRepo: ISlidersRepository) {}

  async findAll(langId: string = 'en') {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
    };
    return this.slidersRepo.findClientList(query, langId);
  }
}
