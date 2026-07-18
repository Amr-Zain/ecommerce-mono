import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { BaseRepository, TranslationFields } from '@/common/repositories/base.repository';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { IRolesRepository } from '@/common/interfaces';

type Role = Prisma.RoleGetPayload<{
  include: { permissions: true; translations: true };
}>;

@Injectable()
export class RolesRepository extends BaseRepository<Role> implements IRolesRepository {
  protected readonly searchConfig = {
    translationFields: ['name'] satisfies TranslationFields<Role>[],
  };

  protected readonly allowedIncludes = {
    translations: true,
    permissions: { select: { id: true, resource: true, action: true } },
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService) {
    super(prisma, queryBuilder);
  }

  protected getModel() {
    return this.prisma.role;
  }

  async findAll(query: AdvancedQueryDto): Promise<PaginatedResult<Role> | Role[]> {
    const where = this.buildWhereClause(query);

    return this.paginate(query, where, {
      include: {
        translations: true,
        permissions: {
          select: {
            id: true,
            resource: true,
            action: true,
          },
        },
      },
    });
  }

  async findByIdWithRelations(id: bigint): Promise<Role | null> {
    return this.findById(id, {
      include: {
        translations: true,
        permissions: {
          select: {
            id: true,
            resource: true,
            action: true,
          },
        },
      },
    });
  }

  async createRole(data: Record<string, unknown>): Promise<Role> {
    const { permissions, translations, ...rest } = data;
    const finalData: Record<string, unknown> = { ...rest };

    if (Array.isArray(translations)) {
      finalData.translations = translations;
    }

    if (Array.isArray(permissions) && permissions.length > 0) {
      const permissionIds = permissions.map((id) => BigInt(id as string));

      finalData.permissions = {
        connect: permissionIds.map((id) => ({ id })),
      };
    }

    return this.create(finalData, {
      include: {
        translations: true,
        permissions: {
          select: {
            id: true,
            resource: true,
            action: true,
          },
        },
      },
    });
  }

  async updateRole(id: bigint, data: Record<string, unknown>): Promise<Role> {
    const { permissions, translations, ...rest } = data;
    const finalData: Record<string, unknown> = { ...rest };

    if (Array.isArray(translations)) {
      finalData.translations = translations;
    }

    if (Array.isArray(permissions)) {
      const permissionIds = permissions.map((id) => BigInt(id as string));

      finalData.permissions = {
        set: permissionIds.map((id) => ({ id })),
      };
    }

    return this.update(id, finalData, {
      include: {
        translations: true,
        permissions: {
          select: {
            id: true,
            resource: true,
            action: true,
          },
        },
      },
    });
  }

  listDistinctPermissions() {
    return this.prisma.permission.findMany({
      distinct: ['resource', 'action'],
      select: { id: true, resource: true, action: true },
    });
  }

  async syncDiscoveredPermissions(permissions: Array<{ resource: string; action: string }>): Promise<number> {
    const existing = await this.prisma.permission.findMany({ select: { resource: true, action: true } });
    const existingKeys = new Set(existing.map((permission) => `${permission.resource}:${permission.action}`));
    const missing = permissions.filter(
      (permission) => !existingKeys.has(`${permission.resource}:${permission.action}`),
    );
    if (!missing.length) return 0;

    await this.prisma.$transaction(async (tx) => {
      let superAdmin = await tx.role.findFirst({
        where: { translations: { some: { langId: 'en', name: 'Super Admin' } } },
      });
      if (!superAdmin) {
        superAdmin = await tx.role.create({
          data: {
            isActive: true,
            translations: {
              create: [
                { langId: 'en', name: 'Super Admin' },
                { langId: 'ar', name: 'مدير عام' },
              ],
            },
          },
        });
      }
      await tx.permission.createMany({ data: missing, skipDuplicates: true });
      const created = await tx.permission.findMany({ where: { OR: missing }, select: { id: true } });
      await tx.role.update({ where: { id: superAdmin.id }, data: { permissions: { connect: created } } });
    });
    return missing.length;
  }
}
