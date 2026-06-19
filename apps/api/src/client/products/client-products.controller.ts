import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '@/auth/guards/optional-jwt-auth.guard';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { ClientProductsService } from './client-products.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ApiCatalogQuery } from '@/common/swagger/api-catalog-query.decorator';

@ApiContext('client')
@ApiTags('Client - Products')
@Controller('products')
export class ClientProductsController {
  constructor(private readonly productsService: ClientProductsService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiCatalogQuery()
  findAll(
    @ParsedQuery(CatalogQueryDto) query: CatalogQueryDto,
    @I18nLang() lang: string,
    @CurrentUser() user?: { id: bigint },
  ) {
    return this.productsService.findAll(query, lang, user?.id);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/related')
  @ApiQuery({ name: 'limit', required: false, example: '8' })
  findRelated(@Param('id') id: string, @I18nLang() lang: string, @Query('limit') limit?: string) {
    return this.productsService.findRelated(BigInt(id), lang, Number(limit) || 8);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @I18nLang() lang: string) {
    return this.productsService.findOne(BigInt(id), lang);
  }
}
