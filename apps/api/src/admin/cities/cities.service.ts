import { Injectable, Inject } from '@nestjs/common';
import { CITIES_REPOSITORY } from '@/common/interfaces';
import { CitiesRepository } from '@/core/cities/cities.repository';
import { CityQueryDto } from './dto/city-query';
import { createCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';

@Injectable()
export class CitiesService {
  constructor(
    @Inject(CITIES_REPOSITORY) private readonly CitiesRepo: CitiesRepository,
    private readonly publicCacheInvalidation: PublicCacheInvalidationPublisher,
  ) {}

  async createCity(city: createCityDto) {
    const created = await this.CitiesRepo.createCity(city as unknown as Parameters<CitiesRepository['createCity']>[0]);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.locationsChanged);
    return created;
  }

  async updateCity(id: number | bigint, city: UpdateCityDto) {
    const updated = await this.CitiesRepo.updateCity(
      id,
      city as unknown as Parameters<CitiesRepository['updateCity']>[1],
    );
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.locationsChanged);
    return updated;
  }

  async findAll(query: CityQueryDto) {
    return this.CitiesRepo.findAll(query);
  }

  async findOne(id: number | bigint, langId?: string) {
    return this.CitiesRepo.findByIdWithRelationsOrThrow(id, langId);
  }

  async deleteCity(id: number | bigint) {
    const deleted = await this.CitiesRepo.deleteCity(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.locationsChanged);
    return deleted;
  }
}
