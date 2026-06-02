import { IsNumber } from 'class-validator';

export class ToggleWishlistDto {
  @IsNumber()
  productId!: number;
}
