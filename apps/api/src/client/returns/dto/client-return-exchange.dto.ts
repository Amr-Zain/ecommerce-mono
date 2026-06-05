import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateReturnRequestItemDto {
  @IsString()
  orderItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateReturnRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReturnRequestItemDto)
  items!: CreateReturnRequestItemDto[];

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateExchangeRequestItemDto {
  @IsString()
  orderItemId!: string;

  @IsString()
  newVariantId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateExchangeRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExchangeRequestItemDto)
  items!: CreateExchangeRequestItemDto[];

  @IsOptional()
  @IsString()
  note?: string;
}
