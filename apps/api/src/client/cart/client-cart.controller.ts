import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { I18nLang } from 'nestjs-i18n';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientCartService } from './client-cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { Public } from '@/auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '@/auth/guards/optional-jwt-auth.guard';
import { AnonymousSessionService } from '@/auth/services/anonymous-session.service';
import { ApiTags } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Cart')
@Controller('cart')
export class ClientCartController {
  constructor(
    private readonly cartService: ClientCartService,
    private readonly anonymousSessions: AnonymousSessionService,
  ) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getCart(@Req() request: Request, @CurrentUser() user: { id: bigint } | null, @I18nLang() lang: string) {
    return this.cartService.getCart(await this.anonymousSessions.resolveOwner(request, user), lang);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('items')
  async addItem(
    @Req() request: Request,
    @CurrentUser() user: { id: bigint } | null,
    @Body() dto: AddToCartDto,
    @I18nLang() lang: string,
  ) {
    return this.cartService.addItem(await this.anonymousSessions.resolveOwner(request, user, true), dto, lang);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Patch('items/:id')
  async updateItem(
    @Req() request: Request,
    @CurrentUser() user: { id: bigint } | null,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @I18nLang() lang: string,
  ) {
    return this.cartService.updateItemQuantity(
      await this.anonymousSessions.resolveOwner(request, user, true),
      BigInt(id),
      dto,
      lang,
    );
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Delete('items/:id')
  async removeItem(
    @Req() request: Request,
    @CurrentUser() user: { id: bigint } | null,
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    return this.cartService.removeItem(
      await this.anonymousSessions.resolveOwner(request, user, true),
      BigInt(id),
      lang,
    );
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Delete()
  async clearCart(@Req() request: Request, @CurrentUser() user: { id: bigint } | null, @I18nLang() lang: string) {
    return this.cartService.clearCart(await this.anonymousSessions.resolveOwner(request, user, true), lang);
  }
}
