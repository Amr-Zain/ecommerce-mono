import { Controller, Get, Param } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientProductsService } from './client-products.service';

@ApiContext('client')
@Controller('products')
export class ClientProductsController {
  constructor(private readonly productsService: ClientProductsService) {}

  @Public()
  @Get()
  findAll(@I18nLang() lang: string) {
    return this.productsService.findAll(lang);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(BigInt(id));
  }
}