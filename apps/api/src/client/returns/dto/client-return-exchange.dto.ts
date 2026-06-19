import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReturnRequestItemDto {
  @IsString()
  @ApiProperty({ example: "1", description: 'orderItemId' })
  orderItemId!: string;

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 3, description: 'quantity' })
  quantity!: number;

  @IsString()
  @ApiProperty({ example: "RESTOCK", description: 'reason' })
  reason!: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "Return request rejected after review", description: 'note' })
  note?: string;
}

export class CreateReturnRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReturnRequestItemDto)
  @ApiProperty({ example: [], description: 'items' })
  items!: CreateReturnRequestItemDto[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "Return request rejected after review", description: 'note' })
  note?: string;
}

export class CreateExchangeRequestItemDto {
  @IsString()
  @ApiProperty({ example: "1", description: 'orderItemId' })
  orderItemId!: string;

  @IsString()
  @ApiProperty({ example: "1", description: 'newVariantId' })
  newVariantId!: string;

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 3, description: 'quantity' })
  quantity!: number;

  @IsString()
  @ApiProperty({ example: "RESTOCK", description: 'reason' })
  reason!: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "Return request rejected after review", description: 'note' })
  note?: string;
}

export class CreateExchangeRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExchangeRequestItemDto)
  @ApiProperty({ example: [], description: 'items' })
  items!: CreateExchangeRequestItemDto[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "Return request rejected after review", description: 'note' })
  note?: string;
}
