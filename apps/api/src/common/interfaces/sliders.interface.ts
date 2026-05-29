import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';
import { QueryOptions } from '../../common/repositories/base.repository';

export interface SliderTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  title: string | null;
}

export interface Slider {
  id: bigint;
  sortOrder: number;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: SliderTranslation[];
  slide?: unknown;
}

export const SLIDERS_REPOSITORY = Symbol('ISlidersRepository');

export interface ISlidersRepository extends IBaseRepository<Slider> {
  findAll(query: AdvancedQueryDto, langId?: string, options?: QueryOptions): Promise<PaginatedResult<Slider> | Slider[]>;
  findByIdWithAllTranslations(id: number | bigint): Promise<Slider | null>;
}