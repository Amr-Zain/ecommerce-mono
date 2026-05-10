import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma';
import { CountriesRepository, CountryType } from './countries.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { omitUndefined } from '@/common/utils/omit-undefined.util';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
class CountriesService {
  constructor(private readonly repo: CountriesRepository) {}

  async getAllCountries(query: AdvancedQueryDto): Promise<PaginatedResult<CountryType>> {
    return this.repo.findAll(query);
  }

  async updateCountry(id: number, country: UpdateCountryDto): Promise<CountryType> {
    return this.repo.updateCountry(this.toCountryUpdateInput(country), id);
  }

  async deleteCountry(id: number): Promise<CountryType> {
    return this.repo.deleteCountry(id);
  }

  async createCountry(country: CreateCountryDto): Promise<CountryType> {
    return this.repo.createCountry(this.toCountryCreateInput(country));
  }

  async getCountryById(id: number | bigint): Promise<CountryType | null> {
    return this.repo.findByIdWithRelations(id);
  }

  async getCountryByIdWithAllTranslations(id: number | bigint): Promise<CountryType | null> {
    return this.repo.findByIdWithAllTranslations(id);
  }

  private toCountryCreateInput(dto: CreateCountryDto): Prisma.CountryCreateInput {
    const { translations, ...scalars } = dto;
    return {
      ...(omitUndefined(scalars) as Omit<Prisma.CountryCreateInput, 'translations'>),
      translations: {
        create: translations.map((row) => omitUndefined(row) as Prisma.CountryTranslationCreateWithoutCountryInput),
      },
    };
  }

  private toCountryUpdateInput(dto: UpdateCountryDto): Prisma.CountryUpdateInput {
    const { translations, ...scalars } = dto;
    const data = omitUndefined(scalars) as Prisma.CountryUpdateInput;

    if (translations !== undefined) {
      data.translations = {
        deleteMany: {},
        create: translations.map((row) => omitUndefined(row) as Prisma.CountryTranslationCreateWithoutCountryInput),
      };
    }

    return data;
  }
}

export default CountriesService;
