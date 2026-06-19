import { IsOptional, IsInt, Min, Max, IsObject, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Advanced Query DTO supporting nested filters and sort
 * Example: ?paginate=1&filters[is_active]=1&sort[created_at]=asc&page=1&limit=10
 */
export class AdvancedQueryDto {
  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @ApiPropertyOptional({ example: 1, description: 'page' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @Max(100, { message: i18nValidationMessage<I18nTranslations>('validation.MAX') })
  @ApiPropertyOptional({ example: 10, description: 'limit' })
  limit?: number = 10;

  // Paginate flag
  @IsOptional()
  @Transform(({ value }) => value === '1' || value === 'true' || value === true)
  @ApiPropertyOptional({ example: true, description: 'paginate' })
  paginate?: boolean = true;

  // Nested filters object: filters[field]=value
  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ example: { isActive: true }, description: 'filters' })
  filters?: Record<string, string | number | boolean> = {};

  // Nested sort object: sort[field]=direction
  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ example: { createdAt: 'desc' }, description: 'sort' })
  sort?: Record<string, 'asc' | 'desc'> = {};

  // Search query
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'iphone', description: 'search' })
  search?: string;

  // Include relations
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') return value.split(',');
    return [];
  })
  @ApiPropertyOptional({ example: ['translations'], description: 'include' })
  include?: string[] = [];
}
