import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma';
import { CountriesRepository, CountryType } from './countries.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(private readonly repo: CountriesRepository) {}

  async getAllCountries(query: AdvancedQueryDto): Promise<PaginatedResult<CountryType>> {
    return this.repo.findAll(query);
  }

  async updateCountry(id: number, country: UpdateCountryDto): Promise<CountryType> {
    return this.repo.updateCountry(country as Prisma.CountryUpdateInput, id);
  }

  async deleteCountry(id: number): Promise<CountryType> {
    return this.repo.deleteCountry(id);
  }

  async createCountry(country: CreateCountryDto): Promise<CountryType> {
    return this.repo.createCountry(country as Prisma.CountryCreateInput);
  }

  async getCountryById(id: number | bigint): Promise<CountryType | null> {
    return this.repo.findByIdWithRelations(id);
  }

  async getCountryByIdWithAllTranslations(id: number | bigint): Promise<CountryType | null> {
    return this.repo.findByIdWithAllTranslations(id);
  }
}
