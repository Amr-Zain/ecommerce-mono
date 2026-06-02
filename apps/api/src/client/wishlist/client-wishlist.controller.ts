import { Body, Controller, Get, Post } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientWishlistService } from './client-wishlist.service';
import { ToggleWishlistDto } from './dto/wishlist.dto';

@ApiContext('client')
@Controller('wishlist')
export class ClientWishlistController {
  constructor(private readonly wishlistService: ClientWishlistService) {}

  @Get()
  findAll(@CurrentUser() user: { id: bigint }, @I18nLang() lang: string) {
    return this.wishlistService.findAll(user.id, lang);
  }

  @Post()
  toggle(
    @CurrentUser() user: { id: bigint },
    @Body() dto: ToggleWishlistDto,
    @I18nLang() lang: string,
  ) {
    return this.wishlistService.toggle(user.id, BigInt(dto.productId), lang);
  }
}
