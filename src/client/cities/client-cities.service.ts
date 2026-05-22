import { Injectable, Inject } from '@nestjs/common';
import { CITIES_REPOSITORY } from '@/common/interfaces';
import { CitiesRepository } from '@/core/cities/cities.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientCitiesService {
  constructor(@Inject(CITIES_REPOSITORY) private readonly citiesRepo: CitiesRepository) {}

  async findAll(countryId?: string) {
    const filters: Record<string, string | number | boolean> = { isActive: true };
    if (countryId) {
      filters.countryId = countryId;
    }
    const query: AdvancedQueryDto = {
      paginate: false,
      filters,
    };
    return this.citiesRepo.findAll(query);
  }

  async findOne(id: bigint) {
    return this.citiesRepo.findByIdWithRelations(id);
  }
}