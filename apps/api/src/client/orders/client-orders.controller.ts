import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientOrdersService } from './client-orders.service';
import { CancelOrderDto, OrderQueryDto } from './dto/order.dto';

@ApiContext('client')
@Controller('orders')
export class ClientOrdersController {
  constructor(private readonly ordersService: ClientOrdersService) {}

  @Get()
  findAll(@CurrentUser() user: { id: bigint }, @Query() query: OrderQueryDto, @I18nLang() lang: string) {
    return this.ordersService.findAll(user.id, query, lang);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: bigint }, @Param('id') id: string, @I18nLang() lang: string) {
    return this.ordersService.findOne(user.id, BigInt(id), lang);
  }

  @Post(':id/cancel')
  cancel(
    @CurrentUser() user: { id: bigint },
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @I18nLang() lang: string,
  ) {
    return this.ordersService.cancel(user.id, BigInt(id), dto, lang);
  }
}
