import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';

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

export interface ClientShowRoomView {
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
  country: { id: bigint; translations: Array<{ name: string }> };
  translations: Array<Pick<ShowRoomTranslation, 'name' | 'address' | 'city' | 'langId'>>;
}

export const SHOW_ROOMS_REPOSITORY = Symbol('IShowRoomsRepository');

export interface IShowRoomsRepository extends IBaseRepository<ShowRoom> {
  findAll(query: AdvancedQueryDto, langId?: string): Promise<PaginatedResult<ShowRoom> | ShowRoom[]>;
  findClientList(
    query: AdvancedQueryDto,
    langId: string,
  ): Promise<PaginatedResult<ClientShowRoomView> | ClientShowRoomView[]>;
  findByIdWithAllTranslations(id: number | bigint): Promise<ShowRoom | null>;
}
