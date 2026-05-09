import { IsOptional, IsInt, Min, Max, IsObject, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';

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
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @Max(100, { message: i18nValidationMessage<I18nTranslations>('validation.MAX') })
  limit?: number = 10;

  // Paginate flag
  @IsOptional()
  @Transform(({ value }) => value === '1' || value === 'true' || value === true)
  paginate?: boolean = true;

  // Nested filters object: filters[field]=value
  @IsOptional()
  @IsObject()
  filters?: Record<string, string | number | boolean> = {};

  // Nested sort object: sort[field]=direction
  @IsOptional()
  @IsObject()
  sort?: Record<string, 'asc' | 'desc'> = {};

  // Search query
  @IsOptional()
  @IsString()
  search?: string;

  // Include relations
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') return value.split(',');
    return [];
  })
  include?: string[] = [];
}
