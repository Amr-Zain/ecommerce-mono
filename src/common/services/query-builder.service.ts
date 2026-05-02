import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma';

@Injectable()
export class QueryBuilderService {
    /**
     * Build where conditions from filters object
     * Example: { is_active: '1', role_id: '2' } => { isActive: true, roleId: 2n }
     */
    buildFiltersCondition(filters: Record<string, any>): any {
        if (!filters || Object.keys(filters).length === 0) {
            return {};
        }

        const conditions: any = {};

        for (const [key, value] of Object.entries(filters)) {
            // Convert string booleans to actual booleans
            if (value === '1' || value === 'true') {
                conditions[key] = true;
            } else if (value === '0' || value === 'false') {
                conditions[key] = false;
            } else {
                conditions[key] = value;
            }
        }

        return conditions;
    }

    /**
     * Build search condition for multiple fields
     */
    buildSearchCondition(search: string, fields: string[]): any {
        if (!search || fields.length === 0) {
            return {};
        }

        return {
            OR: fields.map((field) => ({
                [field]: {
                    contains: search,
                    mode: 'insensitive' as Prisma.QueryMode,
                },
            })),
        };
    }

    /**
     * Combine multiple where conditions
     */
    combineWhereConditions(...conditions: any[]): any {
        const validConditions = conditions.filter(
            (c) => c && Object.keys(c).length > 0,
        );

        if (validConditions.length === 0) {
            return {};
        }

        if (validConditions.length === 1) {
            return validConditions[0];
        }

        return {
            AND: validConditions,
        };
    }
}
