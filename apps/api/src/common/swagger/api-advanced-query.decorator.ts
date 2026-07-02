import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

/**
 * Adds Swagger query parameter documentation for the common AdvancedQueryDto fields.
 * Use on list endpoints that accept `ParsedQuery(AdvancedQueryDto)`.
 */
export function ApiAdvancedQuery() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number' }),
    ApiQuery({ name: 'limit', required: false, example: 10, description: 'Items per page' }),
    ApiQuery({ name: 'paginate', required: false, example: true, description: 'Enable pagination' }),
    ApiQuery({
      name: 'filters[isActive]',
      required: false,
      example: '1',
      description: 'Nested filters (e.g. filters[isActive]=1)',
    }),
    ApiQuery({
      name: 'sort[createdAt]',
      required: false,
      example: 'desc',
      description: 'Nested sort (e.g. sort[createdAt]=desc)',
    }),
    ApiQuery({ name: 'search', required: false, example: 'iphone', description: 'Search term' }),
    ApiQuery({
      name: 'include',
      required: false,
      example: 'translations',
      description: 'Relations to include (comma-separated)',
    }),
  );
}
