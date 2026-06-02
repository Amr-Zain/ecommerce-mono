import { Controller, Headers, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '@/auth/decorators/public.decorator';
import { StripeWebhookService } from './stripe-webhook.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Public()
@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  @Post()
  async handleStripeWebhook(@Req() req: RawBodyRequest, @Headers('stripe-signature') signature?: string) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
    const event = this.stripeWebhookService.constructEvent(rawBody, signature);
    return this.stripeWebhookService.handleEvent(event);
  }
}
