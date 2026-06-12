import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';
import { QueryOptions } from '../../common/repositories/base.repository';

export interface CountryTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  name: string;
  nationality: string | null;
  shortName: string | null;
  currencyCode: string | null;
}

export interface Country {
  id: bigint;
  phoneCode: string;
  phoneLength: number | null;
  shippingPrice: number;
  isActive: boolean;
  phoneStartWith: number;
  createdAt: Date;
  updatedAt: Date;
  translations: CountryTranslation[];
  flag?: unknown;
}

export const COUNTRIES_REPOSITORY = Symbol('ICountriesRepository');

export interface ICountriesRepository extends IBaseRepository<Country> {
  findAll(
    query: AdvancedQueryDto,
    langId?: string,
    options?: QueryOptions,
  ): Promise<PaginatedResult<Country> | Country[]>;
  findByIdWithRelations(id: number | bigint): Promise<Country | null>;
  findByIdWithAllTranslations(id: number | bigint): Promise<Country | null>;
  createCountry(country: unknown): Promise<Country>;
  updateCountry(country: unknown, id: number): Promise<Country>;
  deleteCountry(id: number | bigint): Promise<Country>;
}
