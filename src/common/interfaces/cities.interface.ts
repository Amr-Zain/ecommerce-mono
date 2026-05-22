import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';
import { Country } from './countries.interface';

export interface CityTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  name: string;
}

export interface City {
  id: bigint;
  countryId: bigint;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: CityTranslation[];
  country?: Country;
}

export const CITIES_REPOSITORY = Symbol('ICitiesRepository');

export interface ICitiesRepository extends IBaseRepository<City> {
  findAll(query: AdvancedQueryDto, langId?: string): Promise<PaginatedResult<City> | City[]>;
  findByIdWithRelations(id: number | bigint, langId?: string): Promise<City | null>;
  createCity(city: unknown): Promise<City>;
  updateCity(id: number | bigint, city: unknown): Promise<City>;
  deleteCity(id: number | bigint): Promise<City>;
}