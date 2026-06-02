import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientCartService } from './client-cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiContext('client')
@Controller('cart')
export class ClientCartController {
  constructor(private readonly cartService: ClientCartService) {}

  @Get()
  getCart(@CurrentUser() user: { id: bigint }, @I18nLang() lang: string) {
    return this.cartService.getCart(user.id, lang);
  }

  @Post('items')
  addItem(
    @CurrentUser() user: { id: bigint },
    @Body() dto: AddToCartDto,
    @I18nLang() lang: string,
  ) {
    return this.cartService.addItem(user.id, dto, lang);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: { id: bigint },
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @I18nLang() lang: string,
  ) {
    return this.cartService.updateItemQuantity(user.id, BigInt(id), dto, lang);
  }

  @Delete('items/:id')
  removeItem(
    @CurrentUser() user: { id: bigint },
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    return this.cartService.removeItem(user.id, BigInt(id), lang);
  }

  @Delete()
  clearCart(@CurrentUser() user: { id: bigint }, @I18nLang() lang: string) {
    return this.cartService.clearCart(user.id, lang);
  }
}
