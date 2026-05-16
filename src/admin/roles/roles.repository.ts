import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../../prisma';
import { BaseRepository } from '../../common/repositories/base.repository';
import { QueryBuilderService } from '../../common/services/query-builder.service';
import { AdvancedQueryDto } from '../../common/dto/advanced-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

export type Role = Prisma.RoleGetPayload<{
  include: { permissions: true; translations: true };
}>;

@Injectable()
export class RolesRepository extends BaseRepository<Role> {
  protected readonly modelName = Prisma.ModelName.Role;

  constructor(
    prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
  ) {
    super(prisma);
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
      finalData.translations = {
        create: translations,
      };
    }

    if (Array.isArray(permissions) && permissions.length > 0) {
      const permissionIds = permissions.map((id) => BigInt(id as string));
      const definitions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
        select: { resource: true, action: true },
      });

      finalData.permissions = {
        create: definitions,
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
      finalData.translations = {
        deleteMany: {},
        create: translations,
      };
    }

    if (Array.isArray(permissions)) {
      const permissionIds = permissions.map((id) => BigInt(id as string));
      const definitions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
        select: { resource: true, action: true },
      });

      finalData.permissions = {
        deleteMany: {},
        create: definitions,
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

  private buildWhereClause(query: AdvancedQueryDto): Prisma.RoleWhereInput {
    const conditions: Prisma.RoleWhereInput[] = [];

    if (query.filters && Object.keys(query.filters).length > 0) {
      const filterCondition = this.queryBuilder.buildFiltersCondition<Prisma.RoleWhereInput>(query.filters);
      conditions.push(filterCondition);
    }

    if (query.search) {
      const searchCondition = this.queryBuilder.buildSearchCondition(query.search, ['translations.name']);
      conditions.push(searchCondition as Prisma.RoleWhereInput);
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }
}
