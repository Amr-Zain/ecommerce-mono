import { Transform, Type } from 'class-transformer';
import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchSuggestionsDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ example: 'gold ring' })
  q!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  @ApiPropertyOptional({ default: 10 })
  limit: number = 10;
}
