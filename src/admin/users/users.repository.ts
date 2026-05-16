import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../../prisma';
import { BaseRepository } from '../../common/repositories/base.repository';
import { QueryBuilderService } from '../../common/services/query-builder.service';
import { AdvancedQueryDto } from '../../common/dto/advanced-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { MediaService } from '../../media/media.service';

export type User = Prisma.UserGetPayload<{
  include: { role: true; media: true };
}>;

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  protected readonly modelName = Prisma.ModelName.User;
  protected readonly isSingleMedia = true;
  protected readonly allowedMediaTypes = ['image'];

  constructor(
    prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    private readonly mediaServiceInstance: MediaService,
  ) {
    super(prisma, mediaServiceInstance);
  }

  protected getModel() {
    return this.prisma.user;
  }

  async findAll(query: AdvancedQueryDto): Promise<PaginatedResult<User> | User[]> {
    const where = this.buildWhereClause(query);

    return this.paginate(query, where, {
      include: {
        role: true,
      },
    });
  }

  async findAllAdmins(query: AdvancedQueryDto): Promise<PaginatedResult<User> | User[]> {
    query.filters = { ...(query.filters || {}), userType: 'admin' };
    const result = await this.findAll(query);
    return this.excludePasswords(result);
  }

  async findAllClients(query: AdvancedQueryDto): Promise<PaginatedResult<User> | User[]> {
    query.filters = { ...(query.filters || {}), userType: 'client' };
    const result = await this.findAll(query);
    return this.excludePasswords(result);
  }

  async findByIdAndType(id: bigint, type: 'admin' | 'client'): Promise<User | null> {
    const user = await this.findById(id, {
      include: {
        role: true,
        addresses: true,
        reviews: true,
      },
    });

    if (user && user.userType === type) {
      return this.excludePassword(user);
    }
    return null;
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

  /**
   * Find user by ID with relations
   */
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

  private buildWhereClause(query: AdvancedQueryDto): Prisma.UserWhereInput {
    const conditions: Prisma.UserWhereInput[] = [];

    // Apply filters from filters object
    if (query.filters && Object.keys(query.filters).length > 0) {
      const filterCondition = this.queryBuilder.buildFiltersCondition<Prisma.UserWhereInput>(query.filters);
      conditions.push(filterCondition);
    }

    // Search in name and email
    if (query.search) {
      const searchCondition = this.queryBuilder.buildSearchCondition(query.search, ['name', 'email']);
      conditions.push(searchCondition as Prisma.UserWhereInput);
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }
}
