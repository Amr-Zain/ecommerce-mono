import { Controller, Get, Patch, Post, Param, Body, Query } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AuthUserPayload } from '@/auth/auth.service';
import { AdminOrdersService } from './admin-orders.service';
import { UpdateOrderStatusDto, AdminOrderQueryDto } from './dto/admin-order.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiContext('admin')
@ApiTags('Admin - Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Get()
  findAll(@Query() query: AdminOrderQueryDto, @I18nLang() lang: string) {
    return this.ordersService.findAll(query, lang);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @I18nLang() lang: string) {
    return this.ordersService.findOne(BigInt(id), lang);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthUserPayload,
    @I18nLang() lang: string,
  ) {
    return this.ordersService.updateStatus(BigInt(id), dto, user, lang);
  }

  @Post(':id/confirm-payment')
  confirmPayment(@Param('id') id: string, @CurrentUser() user: AuthUserPayload, @I18nLang() lang: string) {
    return this.ordersService.confirmPayment(BigInt(id), user, lang);
  }

  @Post(':id/cancellation-refunds/:refundId/retry')
  retryCancellationRefund(
    @Param('id') id: string,
    @Param('refundId') refundId: string,
    @CurrentUser() user: AuthUserPayload,
    @I18nLang() lang: string,
  ) {
    return this.ordersService.retryCancellationRefund(BigInt(id), BigInt(refundId), user, lang);
  }
}
