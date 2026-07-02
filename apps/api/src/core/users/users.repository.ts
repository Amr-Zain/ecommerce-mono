import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { BaseRepository, ScalarFields } from '@/common/repositories/base.repository';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { MediaService } from '@/media/media.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { USERS_REPOSITORY, IUsersRepository } from '@/common/interfaces';

type User = Prisma.UserGetPayload<{
  include: { role: true };
}>;

@Injectable()
export class UsersRepository extends BaseRepository<User> implements IUsersRepository {
  protected readonly mediaConfig = {
    avatar: { collection: 'avatar', single: true, allowedTypes: [MediaType.IMAGE] },
  };

  protected readonly searchConfig = {
    directFields: ['name', 'email'] satisfies ScalarFields<User>[],
  };

  protected readonly allowedIncludes = {
    role: { select: { id: true, isActive: true, translations: true } },
    addresses: true,
    reviews: true,
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, mediaService, queryBuilder);
  }

  protected getModel() {
    return this.prisma.user;
  }

  async findAll(query: AdvancedQueryDto, langId: string = 'en'): Promise<PaginatedResult<User> | User[]> {
    const where = this.buildWhereClause(query);

    return this.paginate(query, where, {
      include: {
        role: {
          select: {
            id: true,
            isActive: true,
            translations: {
              where: {
                langId,
              },
            },
          },
        },
      },
    });
  }

  async findAllAdmins(query: AdvancedQueryDto, langId: string = 'en'): Promise<PaginatedResult<User> | User[]> {
    query.filters = { ...(query.filters || {}), userType: 'admin' };
    const result = await this.findAll(query, langId);
    return this.excludePasswords(result);
  }

  async findAllClients(query: AdvancedQueryDto, langId: string = 'en'): Promise<PaginatedResult<User> | User[]> {
    query.filters = { ...(query.filters || {}), userType: 'client' };
    const result = await this.findAll(query, langId);
    return this.excludePasswords(result);
  }

  async findByIdAndType(id: bigint, type: 'admin' | 'client'): Promise<User | null> {
    const options = {
      include: {
        role: {
          select: {
            id: true,
            isActive: true,
            translations: true,
            permissions: {
              select: {
                id: true,
                resource: true,
                action: true,
              },
            },
          },
        },
        addresses: true,
        reviews: true,
      },
    };
    const user = await this.findById(id, options);

    if (!user || user.userType !== type) {
      return null;
    }

    return this.excludePassword(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne(
      { email },
      {
        include: {
          role: true,
        },
      },
    );
  }

  async findByPhone(phoneCode: string, phone: string): Promise<User | null> {
    return this.findOne(
      { phoneCode, phone },
      {
        include: {
          role: true,
        },
      },
    );
  }

  async findByIdWithRelations(id: bigint): Promise<User | null> {
    return this.findById(id, {
      include: {
        role: true,
        addresses: true,
        reviews: true,
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const user = await this.create(data);
    return this.excludePassword(user);
  }

  async updateUser(id: bigint, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.update(id, data);
    return this.excludePassword(user);
  }

  async deleteUser(id: bigint): Promise<User> {
    const user = await this.delete(id);
    return this.excludePassword(user);
  }

  async emailExists(email: string, excludeId?: bigint): Promise<boolean> {
    const where: Prisma.UserWhereInput = { email };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return this.exists(where);
  }

  public excludePassword(user: User): User {
    if (!user) return user;
    const { password: _p, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  public excludePasswords(result: PaginatedResult<User> | User[]): PaginatedResult<User> | User[] {
    if (Array.isArray(result)) {
      return result.map((u) => this.excludePassword(u));
    }
    return {
      ...result,
      data: result.data.map((u) => this.excludePassword(u)),
    };
  }

  protected buildWhereClause(query: AdvancedQueryDto): Prisma.UserWhereInput {
    // Use the base buildWhereClause which handles filters + searchConfig
    const baseWhere = super.buildWhereClause(query) as Prisma.UserWhereInput;
    const conditions: Prisma.UserWhereInput[] = [];

    if (Object.keys(baseWhere).length > 0) {
      conditions.push(baseWhere);
    }

    // Custom: exclude default role for admin filter
    if (query.filters?.userType === 'admin') {
      conditions.push({ roleId: { not: 1n } });
    }

    return this.queryBuilder!.combineWhereConditions(...conditions);
  }
}
