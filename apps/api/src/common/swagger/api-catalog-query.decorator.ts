import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ApiAdvancedQuery } from './api-advanced-query.decorator';

/**
 * Adds Swagger query parameter documentation for the client catalog list endpoint.
 */
export function ApiCatalogQuery() {
  return applyDecorators(
    ApiAdvancedQuery(),
    ApiQuery({ name: 'collectionSlug', required: false, example: 'summer-collection', description: 'Filter by collection slug' }),
    ApiQuery({ name: 'collection', required: false, example: '1,2', description: 'Filter by collection IDs (comma-separated)' }),
    ApiQuery({ name: 'attributeValue', required: false, example: '1,2', description: 'Filter by attribute value IDs (comma-separated)' }),
    ApiQuery({ name: 'minPrice', required: false, example: 50, description: 'Minimum price' }),
    ApiQuery({ name: 'maxPrice', required: false, example: 500, description: 'Maximum price' }),
    ApiQuery({ name: 'minDiscount', required: false, example: 10, description: 'Minimum discount percentage' }),
    ApiQuery({ name: 'catalogSort', required: false, example: 'newest', description: 'Sort order' }),
  );
}
