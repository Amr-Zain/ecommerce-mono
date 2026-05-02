import { PaginationDto, PaginationMeta, PaginatedResult } from '../dto/pagination.dto';

export class PaginationUtil {
    /**
     * Calculate skip value for Prisma
     */
    static getSkip(page: number, limit: number): number {
        return (page - 1) * limit;
    }

    /**
     * Calculate pagination metadata
     */
    static createMeta(
        page: number,
        limit: number,
        total: number,
    ): PaginationMeta {
        const totalPages = Math.ceil(total / limit);

        return {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }

    /**
     * Create paginated result
     */
    static createResult<T>(
        data: T[],
        page: number,
        limit: number,
        total: number,
    ): PaginatedResult<T> {
        return {
            data,
            meta: this.createMeta(page, limit, total),
        };
    }

    /**
     * Get Prisma pagination params
     */
    static getPrismaParams(dto: PaginationDto) {
        const page = dto.page || 1;
        const limit = dto.limit || 10;

        return {
            skip: this.getSkip(page, limit),
            take: limit,
        };
    }
}
