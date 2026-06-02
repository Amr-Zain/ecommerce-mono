import { Controller, Get, Patch, Post, Param, Body, Query, Headers } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AuthUserPayload } from '@/auth/auth.service';
import { AdminOrdersService } from './admin-orders.service';
import { UpdateOrderStatusDto, OrderRefundDto, AdminOrderQueryDto } from './dto/admin-order.dto';

@ApiContext('admin')
@Controller('orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Get()
  findAll(@Query() query: AdminOrderQueryDto, @Headers('accept-language') lang: string = 'en') {
    return this.ordersService.findAll(query, lang);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('accept-language') lang: string = 'en') {
    return this.ordersService.findOne(BigInt(id), lang);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthUserPayload,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.ordersService.updateStatus(BigInt(id), dto, user, lang);
  }

  @Post(':id/confirm-payment')
  confirmPayment(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserPayload,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.ordersService.confirmPayment(BigInt(id), user, lang);
  }

  @Post(':id/refund')
  refund(
    @Param('id') id: string,
    @Body() dto: OrderRefundDto,
    @CurrentUser() user: AuthUserPayload,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.ordersService.refund(BigInt(id), dto, user, lang);
  }
}
