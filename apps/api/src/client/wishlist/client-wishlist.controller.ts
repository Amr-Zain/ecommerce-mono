import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { I18nLang } from 'nestjs-i18n';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientWishlistService } from './client-wishlist.service';
import { ToggleWishlistDto } from './dto/wishlist.dto';
import { Public } from '@/auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '@/auth/guards/optional-jwt-auth.guard';
import { AnonymousSessionService } from '@/auth/services/anonymous-session.service';
import { ApiTags } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Wishlist')
@Controller('wishlist')
export class ClientWishlistController {
  constructor(
    private readonly wishlistService: ClientWishlistService,
    private readonly anonymousSessions: AnonymousSessionService,
  ) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(@Req() request: Request, @CurrentUser() user: { id: bigint } | null, @I18nLang() lang: string) {
    return this.wishlistService.findAll(await this.anonymousSessions.resolveOwner(request, user), lang);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  async toggle(
    @Req() request: Request,
    @CurrentUser() user: { id: bigint } | null,
    @Body() dto: ToggleWishlistDto,
    @I18nLang() lang: string,
  ) {
    return this.wishlistService.toggle(
      await this.anonymousSessions.resolveOwner(request, user, true),
      BigInt(dto.productId),
      lang,
    );
  }
}
