import { PaginationMeta } from '../../dto/pagination.dto';

export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginatedPayload<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface DataWithMessagePayload<T> {
  data: T;
  message?: string;
}

export type ControllerPayload<T> = T | PaginatedPayload<T> | DataWithMessagePayload<T>;
