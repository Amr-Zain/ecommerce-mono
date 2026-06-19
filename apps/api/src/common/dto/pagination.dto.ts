import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
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
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
