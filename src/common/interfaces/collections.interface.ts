import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';

export interface CollectionTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  name: string;
}

export interface Collection {
  id: bigint;
  parentId: bigint | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: CollectionTranslation[];
  hasChildren?: boolean;
  parent?: Collection | null;
  children?: Collection[];
  image?: unknown;
}

export const COLLECTIONS_REPOSITORY = Symbol('ICollectionsRepository');

export interface ICollectionsRepository extends IBaseRepository<Collection> {
  findAll(query: unknown, langId?: string): Promise<PaginatedResult<Collection> | Collection[]>;
  findOneWithChildren(id: number): Promise<Collection | null>;
  createCollection(data: unknown): Promise<Collection>;
  updateCollection(data: unknown, id: number): Promise<Collection>;
  deleteCollection(id: number | bigint): Promise<Collection>;
}