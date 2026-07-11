import { BadRequestException, Body, Controller, Headers, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/auth/decorators/public.decorator';
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from './payment.constants';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentSecretService } from './payment-secret.service';
import { StripeWebhookService } from './stripe-webhook.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Public()
@ApiTags('Shared - Payment webhooks')
@Controller('webhooks/payments')
export class PaymentWebhookController {
  constructor(
    private readonly paymentGateways: PaymentGatewayService,
    private readonly paymentSecrets: PaymentSecretService,
    private readonly stripeWebhookService: StripeWebhookService,
  ) {}

  @Post(':provider')
  async handleProviderWebhook(
    @Param('provider') provider: string,
    @Req() req: RawBodyRequest,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(body));
    if (provider === PAYMENT_PROVIDERS.stripe) {
      const event = await this.stripeWebhookService.constructEvent(rawBody, this.header(headers, 'stripe-signature'));
      return this.stripeWebhookService.handleEvent(event);
    }

    const gateway = await this.paymentGateways.getRuntimeGatewayByProvider(provider);
    const webhookSecret = gateway.secrets.webhook_secret || gateway.secrets.hash_secret;
    const signature = this.signature(headers);
    if (webhookSecret && !this.paymentSecrets.verifyHmac(webhookSecret, rawBody, signature)) {
      throw new BadRequestException('Invalid payment webhook signature');
    }

    const transactionRef = this.transactionRef(body);
    const status = this.normalizeStatus(provider, body);
    if (!transactionRef) return { received: true, skipped: true };

    await this.paymentGateways.updateSessionStatus(transactionRef, status, body);

    const session = await this.paymentGateways.findSessionByTransactionRef(transactionRef);
    if (session?.pendingCheckoutId && status === PAYMENT_STATUSES.completed) {
      return this.stripeWebhookService.completePendingCheckoutFromProvider(
        session.pendingCheckoutId.toString(),
        transactionRef,
        body,
      );
    }

    if (session?.pendingCheckoutId && [PAYMENT_STATUSES.failed, PAYMENT_STATUSES.expired].includes(status as never)) {
      await this.stripeWebhookService.releasePendingCheckoutFromProvider(
        session.pendingCheckoutId.toString(),
        status,
        body,
      );
    }

    return { received: true };
  }

  @Post('stripe')
  async handleStripe(@Req() req: RawBodyRequest, @Headers('stripe-signature') signature?: string) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
    const event = await this.stripeWebhookService.constructEvent(rawBody, signature);
    return this.stripeWebhookService.handleEvent(event);
  }

  @Post('tap')
  handleTap(
    @Req() req: RawBodyRequest,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    return this.handleProviderWebhook(PAYMENT_PROVIDERS.tap, req, body, headers);
  }

  @Post('moyasar')
  handleMoyasar(
    @Req() req: RawBodyRequest,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    return this.handleProviderWebhook(PAYMENT_PROVIDERS.moyasar, req, body, headers);
  }

  @Post('tabby')
  handleTabby(
    @Req() req: RawBodyRequest,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    return this.handleProviderWebhook(PAYMENT_PROVIDERS.tabby, req, body, headers);
  }

  private transactionRef(body: Record<string, unknown>): string | null {
    const nestedPayment =
      body.payment && typeof body.payment === 'object' ? (body.payment as Record<string, unknown>) : null;
    const data = body.data && typeof body.data === 'object' ? (body.data as Record<string, unknown>) : null;
    const object = data?.object && typeof data.object === 'object' ? (data.object as Record<string, unknown>) : null;
    return (
      this.toText(body.id) ||
      this.toText(body.charge_id) ||
      this.toText(body.payment_id) ||
      this.toText(nestedPayment?.id) ||
      this.toText(object?.id) ||
      null
    );
  }

  private normalizeStatus(provider: string, body: Record<string, unknown>) {
    const raw = (this.toText(body.status) || this.toText(body.event) || this.toText(body.type) || '').toLowerCase();
    if (provider === PAYMENT_PROVIDERS.tabby) {
      if (['authorized', 'closed', 'paid', 'captured'].some((status) => raw.includes(status)))
        return PAYMENT_STATUSES.completed;
      if (['rejected', 'expired', 'canceled', 'cancelled', 'failed'].some((status) => raw.includes(status)))
        return PAYMENT_STATUSES.failed;
    }
    if (['captured', 'paid', 'success', 'succeeded', 'completed', 'verified'].some((status) => raw.includes(status))) {
      return PAYMENT_STATUSES.completed;
    }
    if (['expired'].some((status) => raw.includes(status))) return PAYMENT_STATUSES.expired;
    if (['failed', 'declined', 'rejected', 'cancelled', 'canceled'].some((status) => raw.includes(status))) {
      return PAYMENT_STATUSES.failed;
    }
    return PAYMENT_STATUSES.pending;
  }

  private signature(headers: Record<string, string | string[] | undefined>) {
    return (
      this.header(headers, 'x-signature') ||
      this.header(headers, 'x-tap-signature') ||
      this.header(headers, 'x-moyasar-signature') ||
      this.header(headers, 'x-tabby-signature') ||
      ''
    );
  }

  private header(headers: Record<string, string | string[] | undefined>, name: string) {
    const value = headers[name] || headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }

  private toText(value: unknown) {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
  }
}
