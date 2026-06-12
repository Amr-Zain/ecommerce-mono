import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ROLES_REPOSITORY, Role } from '@/common/interfaces';
import { RolesRepository } from '@/core/roles/roles.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AdvancedQueryDto } from '../../common/dto/advanced-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { PermissionUtil, TransformedPermission } from '../../common/utils/permission.util';

export interface TransformedRole {
  id: string;
  isActive: boolean;
  translations?: Role['translations'];
  permissions: Record<string, TransformedPermission[]>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RolesService {
  constructor(
    @Inject(ROLES_REPOSITORY) private readonly rolesRepository: RolesRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async findAll(query: AdvancedQueryDto): Promise<PaginatedResult<TransformedRole> | TransformedRole[]> {
    const result = await this.rolesRepository.findAll(query);
    if (Array.isArray(result)) {
      return result.map((r) => this.transformRole(r));
    }
    return {
      ...result,
      data: result.data.map((r) => this.transformRole(r)),
    };
  }

  async findOne(id: bigint): Promise<TransformedRole> {
    const role = await this.rolesRepository.findByIdWithRelations(id);
    if (!role) {
      throw new NotFoundException(this.i18n.t('errors.Not Found'));
    }
    return this.transformRole(role);
  }

  async create(createDto: CreateRoleDto): Promise<TransformedRole> {
    const data: Record<string, unknown> = {
      isActive: createDto.isActive ?? true,
      translations: createDto.translations,
      permissions: createDto.permissions,
    };

    const role = await this.rolesRepository.createRole(data);
    return this.transformRole(role);
  }

  async update(id: bigint, updateDto: UpdateRoleDto): Promise<TransformedRole> {
    if (id === 1n) {
      throw new BadRequestException(this.i18n.t('errors.cannot_edit_super_admin_role'));
    }
    await this.findOne(id);

    const data: Record<string, unknown> = {
      isActive: updateDto.isActive,
      translations: updateDto.translations,
      permissions: updateDto.permissions,
    };

    const role = await this.rolesRepository.updateRole(id, data);
    return this.transformRole(role);
  }

  async remove(id: bigint): Promise<TransformedRole> {
    if (id === 1n) {
      throw new BadRequestException(this.i18n.t('errors.cannot_delete_super_admin_role'));
    }
    // Note: this.findOne already returns TransformedRole, but we need the database role for deletion
    const dbRole = await this.rolesRepository.findByIdWithRelations(id);
    if (!dbRole) {
      throw new NotFoundException(this.i18n.t('errors.Not Found'));
    }
    await this.rolesRepository.delete(id);
    return this.transformRole(dbRole);
  }

  private transformRole(role: Role): TransformedRole {
    const { permissions, ...rest } = role;

    return {
      ...rest,
      id: rest.id.toString(),
      permissions: PermissionUtil.groupPermissions(permissions ?? []),
    };
  }
}
