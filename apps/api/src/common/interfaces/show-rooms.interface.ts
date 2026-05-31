import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';
import { QueryOptions } from '../../common/repositories/base.repository';

export interface ShowRoomTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  name: string;
  address: string;
  city: string;
}

export interface ShowRoom {
  id: bigint;
  countryId: bigint;
  phoneCode: string;
  phone: string;
  email: string | null;
  url: string | null;
  lat: number | null;
  lng: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: ShowRoomTranslation[];
}

export const SHOW_ROOMS_REPOSITORY = Symbol('IShowRoomsRepository');

export interface IShowRoomsRepository extends IBaseRepository<ShowRoom> {
  findAll(query: AdvancedQueryDto, langId?: string, options?: QueryOptions): Promise<PaginatedResult<ShowRoom> | ShowRoom[]>;
  findByIdWithAllTranslations(id: number | bigint): Promise<ShowRoom | null>;
}
