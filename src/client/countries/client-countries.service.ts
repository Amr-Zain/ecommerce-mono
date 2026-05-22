import { Injectable, Inject } from '@nestjs/common';
import { COUNTRIES_REPOSITORY } from '@/common/interfaces';
import { CountriesRepository } from '@/core/countries/countries.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientCountriesService {
  constructor(@Inject(COUNTRIES_REPOSITORY) private readonly countriesRepo: CountriesRepository) {}

  async findAll() {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { createdAt: 'asc' },
    };
    return this.countriesRepo.findAll(query);
  }

  async findOne(id: bigint) {
    return this.countriesRepo.findByIdWithRelations(id);
  }
}