import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientCheckoutService } from './client-checkout.service';
import { CheckoutPreviewDto, PlaceOrderDto, VerifyCheckoutPaymentDto } from './dto/checkout.dto';
import { DEFAULT_LANGUAGE } from '@/common/constants/commerce.constants';

@ApiContext('client')
@Controller('checkout')
export class ClientCheckoutController {
  constructor(private readonly checkoutService: ClientCheckoutService) {}

  @Post('preview')
  preview(
    @CurrentUser() user: { id: bigint },
    @Body() dto: CheckoutPreviewDto,
    @Headers('accept-language') lang: string = DEFAULT_LANGUAGE,
  ) {
    return this.checkoutService.previewCheckout(user.id, dto, lang);
  }

  @Post('place-order')
  placeOrder(
    @CurrentUser() user: { id: bigint },
    @Body() dto: PlaceOrderDto,
    @Headers('accept-language') lang: string = DEFAULT_LANGUAGE,
  ) {
    return this.checkoutService.placeOrder(user.id, dto, lang);
  }

  @Post('verify-payment')
  verifyPayment(@CurrentUser() user: { id: bigint }, @Body() dto: VerifyCheckoutPaymentDto) {
    return this.checkoutService.verifyPaymentAndCreateOrder(user.id, dto);
  }
}
