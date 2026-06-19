import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleWishlistDto {
  @IsNumber()
  @ApiProperty({ example: 1, description: 'productId' })
  productId!: number;
}
