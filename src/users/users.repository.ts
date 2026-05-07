import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma';
import { BaseRepository } from '../common/repositories/base.repository';
import { QueryBuilderService } from '../common/services/query-builder.service';
import { AdvancedQueryDto } from '../common/dto/advanced-query.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';

export type User = Prisma.UserGetPayload<{
    include: { role: true; image: true };
}>;

@Injectable()
export class UsersRepository extends BaseRepository<User> {
    constructor(
        prisma: PrismaService,
        private readonly queryBuilder: QueryBuilderService,
    ) {
        super(prisma);
    }

    protected getModel() {
        return this.prisma.user;
    }


    async findAll(query: AdvancedQueryDto): Promise<PaginatedResult<User>> {
        const where = this.buildWhereClause(query);

        return this.paginate(query, where, {
            include: {
                role: true,
                image: true,
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.findOne(
            { email },
            {
                include: {
                    role: true,
                    image: true,
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
                image: true,
                addresses: true,
                reviews: true,
            },
        });
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.create(data);
    }


    async updateUser(id: bigint, data: Prisma.UserUpdateInput): Promise<User> {
        return this.update(id, data);
    }

    async deleteUser(id: bigint): Promise<User> {
        return this.delete(id);
    }

    async emailExists(email: string, excludeId?: bigint): Promise<boolean> {
        const where: Prisma.UserWhereInput = { email };

        if (excludeId) {
            where.id = { not: excludeId };
        }

        return this.exists(where);
    }

    private buildWhereClause(query: AdvancedQueryDto): Prisma.UserWhereInput {
        const conditions: Prisma.UserWhereInput[] = [];

        // Apply filters from filters object
        if (query.filters && Object.keys(query.filters).length > 0) {
            const filterCondition = this.queryBuilder.buildFiltersCondition(query.filters);
            conditions.push(filterCondition);
        }

        // Search in name and email
        if (query.search) {
            const searchCondition = this.queryBuilder.buildSearchCondition(
                query.search,
                ['name', 'email'],
            );
            conditions.push(searchCondition);
        }

        return this.queryBuilder.combineWhereConditions(...conditions);
    }
}
