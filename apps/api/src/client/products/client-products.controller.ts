import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '@/auth/guards/optional-jwt-auth.guard';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientProductsService } from './client-products.service';

@ApiContext('client')
@Controller('products')
export class ClientProductsController {
  constructor(private readonly productsService: ClientProductsService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(@I18nLang() lang: string, @CurrentUser() user?: { id: bigint }) {
    return this.productsService.findAll(lang, user?.id);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: { id: bigint }) {
    return this.productsService.findOne(BigInt(id), user?.id);
  }
}
