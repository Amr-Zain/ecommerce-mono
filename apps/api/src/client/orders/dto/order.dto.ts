import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  productId!: number;

  @IsOptional()
  @IsNumber()
  variantId?: number;

  @IsNumber()
  quantity!: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  addressId?: number;

  @IsString()
  paymentMethod!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}