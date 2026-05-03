import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

/**
 * Custom decorator to parse nested query parameters
 * Handles formats like: ?sort[createdAt]=desc&filters[isActive]=1
 */
export const ParsedQuery = createParamDecorator(
    async (dtoClass: any, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const query = request.query;

        const parsed: any = {};

        for (const key in query) {
            // Check for nested parameters like sort[field] or filters[field]
            const match = key.match(/^(\w+)\[(.+)\]$/);

            if (match) {
                const [, parentKey, childKey] = match;

                if (!parsed[parentKey]) {
                    parsed[parentKey] = {};
                }

                parsed[parentKey][childKey] = query[key];
            } else {
                // Regular parameter
                parsed[key] = query[key];
            }
        }

        // Transform to DTO instance
        const dtoInstance = plainToInstance(dtoClass, parsed);

        // Validate
        const errors = await validate(dtoInstance);
        if (errors.length > 0) {
            console.log('ParsedQuery - Validation errors:', errors);
        }

        return dtoInstance;
    },
);
