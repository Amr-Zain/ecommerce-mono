import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';

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

export interface ClientCountryView {
  id: bigint;
  phoneCode: string;
  phoneLength: number | null;
  phoneStartWith: number;
  translations: Array<Pick<CountryTranslation, 'name' | 'langId'>>;
}

export const COUNTRIES_REPOSITORY = Symbol('ICountriesRepository');

export interface ICountriesRepository extends IBaseRepository<Country> {
  findAll(query: AdvancedQueryDto, langId?: string): Promise<PaginatedResult<Country> | Country[]>;
  findClientList(query: AdvancedQueryDto, langId: string): Promise<ClientCountryView[]>;
  findByIdWithRelations(id: number | bigint): Promise<Country | null>;
  findByIdWithAllTranslations(id: number | bigint): Promise<Country | null>;
  createCountry(country: unknown): Promise<Country>;
  updateCountry(country: unknown, id: number): Promise<Country>;
  deleteCountry(id: number | bigint): Promise<Country>;
}
