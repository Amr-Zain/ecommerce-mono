import { Injectable, Inject } from '@nestjs/common';
import { COUNTRIES_REPOSITORY, Country } from '@/common/interfaces';
import { CountriesRepository } from '@/core/countries/countries.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';

@Injectable()
export class CountriesService {
  constructor(
    @Inject(COUNTRIES_REPOSITORY) private readonly repo: CountriesRepository,
    private readonly publicCacheInvalidation: PublicCacheInvalidationPublisher,
  ) {}

  async getAllCountries(query: AdvancedQueryDto): Promise<PaginatedResult<Country> | Country[]> {
    return this.repo.findAll(query);
  }

  async updateCountry(id: number, country: UpdateCountryDto): Promise<Country> {
    const updated = await this.repo.updateCountry(
      country as unknown as Parameters<CountriesRepository['updateCountry']>[0],
      id,
    );
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.locationsChanged);
    return updated;
  }

  async deleteCountry(id: number): Promise<Country> {
    const deleted = await this.repo.deleteCountry(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.locationsChanged);
    return deleted;
  }

  async createCountry(country: CreateCountryDto): Promise<Country> {
    const created = await this.repo.createCountry(
      country as unknown as Parameters<CountriesRepository['createCountry']>[0],
    );
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.locationsChanged);
    return created;
  }

  async getCountryById(id: number | bigint): Promise<Country> {
    return this.repo.findByIdWithRelationsOrThrow(id);
  }

  async getCountryByIdWithAllTranslations(id: number | bigint): Promise<Country> {
    return this.repo.findByIdOrThrow(id, { include: { translations: true } });
  }
}
