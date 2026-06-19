import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewQueryDto extends PaginationDto {}

export class CreateReviewDto {
  @Type(() => Number)
  @IsInt()
  @ApiProperty({ example: 1, description: 'productId' })
  productId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiProperty({ example: 4, description: 'rating' })
  rating!: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "Updated review", description: 'comment' })
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ example: [], description: 'images' })
  images?: string[];
}

export class UpdateReviewDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiPropertyOptional({ example: 4, description: 'rating' })
  rating?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "Updated review", description: 'comment' })
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ example: [], description: 'images' })
  images?: string[];
}
