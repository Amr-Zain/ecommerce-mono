import { Injectable, Inject } from '@nestjs/common';
import { SLIDERS_REPOSITORY } from '@/common/interfaces';
import { SlidersRepository } from '@/core/sliders/sliders.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientSlidersService {
  constructor(@Inject(SLIDERS_REPOSITORY) private readonly slidersRepo: SlidersRepository) {}

  async findAll() {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
    };
    return this.slidersRepo.findAll(query);
  }
}