import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';

export interface RoleTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  name: string;
}

export interface Permission {
  id: bigint;
  resource: string;
  action: string;
}

export interface Role {
  id: bigint;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations?: RoleTranslation[];
  permissions?: Permission[];
}

export const ROLES_REPOSITORY = Symbol('IRolesRepository');

export interface IRolesRepository {
  findAll(query: AdvancedQueryDto): Promise<PaginatedResult<Role> | Role[]>;
  findByIdWithRelations(id: bigint): Promise<Role | null>;
  createRole(data: Record<string, unknown>): Promise<Role>;
  updateRole(id: bigint, data: Record<string, unknown>): Promise<Role>;
}