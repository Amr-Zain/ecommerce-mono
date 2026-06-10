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

  constructor(
    prisma: PrismaService,
    queryBuilder: QueryBuilderService,
  ) {
    super(prisma, undefined, queryBuilder);
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
}
