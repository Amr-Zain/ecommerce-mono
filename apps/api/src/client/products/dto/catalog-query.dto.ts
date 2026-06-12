import { Transform, Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

const stringValue = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value) : '');
const toArray = ({ value }: { value: unknown }) =>
  (Array.isArray(value) ? value : value == null ? [] : [value]).map(stringValue).filter(Boolean);

export class CatalogQueryDto extends AdvancedQueryDto {
  @IsOptional()
  @IsString()
  collectionSlug?: string;

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  collection?: string[] = [];

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  attributeValue?: string[] = [];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minDiscount?: number;

  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc', 'rating_desc'])
  catalogSort?: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' = 'newest';
}
