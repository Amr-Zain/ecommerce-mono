import { Controller, Post, Body } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientCheckoutService } from './client-checkout.service';
import { CheckoutPreviewDto, PlaceOrderDto, VerifyCheckoutPaymentDto } from './dto/checkout.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Checkout')
@ApiBearerAuth('access-token')
@Controller('checkout')
export class ClientCheckoutController {
  constructor(private readonly checkoutService: ClientCheckoutService) {}

  @Post('preview')
  preview(@CurrentUser() user: { id: bigint }, @Body() dto: CheckoutPreviewDto, @I18nLang() lang: string) {
    return this.checkoutService.previewCheckout(user.id, dto, lang);
  }

  @Post('place-order')
  placeOrder(@CurrentUser() user: { id: bigint }, @Body() dto: PlaceOrderDto, @I18nLang() lang: string) {
    return this.checkoutService.placeOrder(user.id, dto, lang);
  }

  @Post('verify-payment')
  verifyPayment(@CurrentUser() user: { id: bigint }, @Body() dto: VerifyCheckoutPaymentDto) {
    return this.checkoutService.verifyPaymentAndCreateOrder(user.id, dto);
  }
}
