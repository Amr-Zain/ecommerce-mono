import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { IBaseRepository } from './base.repository.interface';
import { Role } from './roles.interface';

export interface Address {
  id: bigint;
  userId: bigint;
  address: string;
  cityId: bigint | null;
  countryId: bigint | null;
  streetName: string | null;
  buildingNumber: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: bigint;
  name: string | null;
  email: string | null;
  roleId: bigint | null;
  role?: Role | null;
  userType: string | null;
  guestToken: string | null;
  phone: string | null;
  gender?: string | null;
  phoneCode: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  settings: unknown | null;
  createdAt: Date;
  updatedAt: Date;
  addresses?: Address[];
  avatar?: unknown;
}

export const USERS_REPOSITORY = Symbol('IUsersRepository');

export type GuestMigrationResult = {
  guestUserId: bigint;
  targetUserId: bigint;
} | null;

export interface IUsersRepository extends IBaseRepository<User> {
  findAll(query: AdvancedQueryDto, langId?: string): Promise<PaginatedResult<User> | User[]>;
  findAllAdmins(query: AdvancedQueryDto, langId?: string): Promise<PaginatedResult<User> | User[]>;
  findAllClients(query: AdvancedQueryDto, langId?: string): Promise<PaginatedResult<User> | User[]>;
  findByIdAndType(id: bigint, type: 'admin' | 'client'): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phoneCode: string, phone: string): Promise<User | null>;
  findByIdWithRelations(id: bigint): Promise<User | null>;
  createUser(data: unknown): Promise<User>;
  updateUser(id: bigint, data: unknown): Promise<User>;
  deleteUser(id: bigint): Promise<User>;
  emailExists(email: string, excludeId?: bigint): Promise<boolean>;
  migrateGuestData(guestToken: string, targetUserId: bigint): Promise<GuestMigrationResult>;
}
