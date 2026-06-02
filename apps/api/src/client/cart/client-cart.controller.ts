import { Controller, Get, Post, Patch, Delete, Body, Param, Headers } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientCartService } from './client-cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiContext('client')
@Controller('cart')
export class ClientCartController {
  constructor(private readonly cartService: ClientCartService) {}

  @Get()
  getCart(@CurrentUser() user: { id: bigint }, @Headers('accept-language') lang: string = 'en') {
    return this.cartService.getCart(user.id, lang);
  }

  @Post('items')
  addItem(
    @CurrentUser() user: { id: bigint },
    @Body() dto: AddToCartDto,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.cartService.addItem(user.id, dto, lang);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: { id: bigint },
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.cartService.updateItemQuantity(user.id, BigInt(id), dto, lang);
  }

  @Delete('items/:id')
  removeItem(
    @CurrentUser() user: { id: bigint },
    @Param('id') id: string,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.cartService.removeItem(user.id, BigInt(id), lang);
  }

  @Delete()
  clearCart(@CurrentUser() user: { id: bigint }, @Headers('accept-language') lang: string = 'en') {
    return this.cartService.clearCart(user.id, lang);
  }
}
