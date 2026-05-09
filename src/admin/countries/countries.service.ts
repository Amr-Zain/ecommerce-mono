import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma';
import { CountriesRepository, CountryType } from './countries.repository';
import { AdvancedQueryDto } from 'src/common/dto/advanced-query.dto';
import { PaginatedResult } from 'src/common/dto/pagination.dto';
import { CreateCountryDto, CountryTranslationDto } from './dto/create-country.dto';
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
    return {
      phoneCode: dto.phoneCode,
      phoneLength: dto.phoneLength,
      shippingPrice: dto.shippingPrice,
      isActive: dto.isActive,
      phoneStartWith: dto.phoneStartWith,
      translations: {
        create: dto.translations.map((translation) => this.toCountryTranslationCreateInput(translation)),
      },
    };
  }

  private toCountryUpdateInput(dto: UpdateCountryDto): Prisma.CountryUpdateInput {
    const data: Prisma.CountryUpdateInput = {};
    this.assignIfDefined(data, 'phoneCode', dto.phoneCode);
    this.assignIfDefined(data, 'phoneLength', dto.phoneLength);
    this.assignIfDefined(data, 'shippingPrice', dto.shippingPrice);
    this.assignIfDefined(data, 'isActive', dto.isActive);
    this.assignIfDefined(data, 'phoneStartWith', dto.phoneStartWith);

    if (dto.translations !== undefined) {
      data.translations = {
        deleteMany: {},
        create: dto.translations.map((translation) => this.toCountryTranslationCreateInput(translation)),
      };
    }

    return data;
  }

  private toCountryTranslationCreateInput(
    translation: CountryTranslationDto,
  ): Prisma.CountryTranslationCreateWithoutCountryInput {
    return {
      langId: translation.langId,
      name: translation.name,
      nationality: translation.nationality,
      shortName: translation.shortName,
      currencyCode: translation.currencyCode,
    };
  }

  private assignIfDefined<K extends keyof Prisma.CountryUpdateInput>(
    target: Prisma.CountryUpdateInput,
    key: K,
    value: Prisma.CountryUpdateInput[K] | undefined,
  ): void {
    if (value !== undefined) {
      target[key] = value;
    }
  }
}

export default CountriesService;
