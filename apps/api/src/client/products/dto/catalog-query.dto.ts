import { Transform, Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

const stringValue = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value) : '');
const toArray = ({ value }: { value: unknown }) =>
  (Array.isArray(value) ? value : value == null ? [] : [value]).map(stringValue).filter(Boolean);

export class CatalogQueryDto extends AdvancedQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'summer-collection', description: 'collectionSlug' })
  collectionSlug?: string;

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ example: ['1', '2'], description: 'collection' })
  collection?: string[] = [];

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ example: ['1', '2'], description: 'attributeValue' })
  attributeValue?: string[] = [];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 50, description: 'minPrice' })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 500, description: 'maxPrice' })
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 10, description: 'minDiscount' })
  minDiscount?: number;

  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc', 'rating_desc'])
  @ApiPropertyOptional({ example: 'newest', description: 'catalogSort' })
  catalogSort?: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' = 'newest';
}
