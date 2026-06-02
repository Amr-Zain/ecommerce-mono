import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientWishlistService } from './client-wishlist.service';
import { ToggleWishlistDto } from './dto/wishlist.dto';

@ApiContext('client')
@Controller('wishlist')
export class ClientWishlistController {
  constructor(private readonly wishlistService: ClientWishlistService) {}

  @Get()
  findAll(@CurrentUser() user: { id: bigint }, @Headers('accept-language') lang: string = 'en') {
    return this.wishlistService.findAll(user.id, lang);
  }

  @Post()
  toggle(
    @CurrentUser() user: { id: bigint },
    @Body() dto: ToggleWishlistDto,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.wishlistService.toggle(user.id, BigInt(dto.productId), lang);
  }
}
