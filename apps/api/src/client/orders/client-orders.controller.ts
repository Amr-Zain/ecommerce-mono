import { Controller, Get, Param, Post, Body, Query, Headers } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientOrdersService } from './client-orders.service';
import { CancelOrderDto, OrderQueryDto } from './dto/order.dto';

@ApiContext('client')
@Controller('orders')
export class ClientOrdersController {
  constructor(private readonly ordersService: ClientOrdersService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: bigint },
    @Query() query: OrderQueryDto,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.ordersService.findAll(user.id, query, lang);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { id: bigint },
    @Param('id') id: string,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.ordersService.findOne(user.id, BigInt(id), lang);
  }

  @Post(':id/cancel')
  cancel(
    @CurrentUser() user: { id: bigint },
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.ordersService.cancel(user.id, BigInt(id), dto, lang);
  }
}