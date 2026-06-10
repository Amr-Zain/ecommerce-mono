import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '../../prisma';
import { COUNTRIES_REPOSITORY, Country } from '@/common/interfaces';
import { CountriesRepository } from '@/core/countries/countries.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(@Inject(COUNTRIES_REPOSITORY) private readonly repo: CountriesRepository) {}

  async getAllCountries(query: AdvancedQueryDto): Promise<PaginatedResult<Country> | Country[]> {
    return this.repo.findAll(query);
  }

  async updateCountry(id: number, country: UpdateCountryDto): Promise<Country> {
    return this.repo.updateCountry(country as Prisma.CountryUpdateInput, id);
  }

  async deleteCountry(id: number): Promise<Country> {
    return this.repo.deleteCountry(id);
  }

  async createCountry(country: CreateCountryDto): Promise<Country> {
    return this.repo.createCountry(country as Prisma.CountryCreateInput);
  }

  async getCountryById(id: number | bigint): Promise<Country> {
    return this.repo.findByIdWithRelationsOrThrow(id);
  }

  async getCountryByIdWithAllTranslations(id: number | bigint): Promise<Country> {
    return this.repo.findByIdOrThrow(id, { include: { translations: true } });
  }
}
