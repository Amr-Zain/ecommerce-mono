import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StripeWebhookService } from './stripe-webhook.service';

@Injectable()
export class PaymentReservationCleanupService {
  private readonly logger = new Logger(PaymentReservationCleanupService.name);

  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async releaseExpiredReservations() {
    const result = await this.stripeWebhookService.releaseExpiredPendingCheckouts();
    if (result.released > 0) {
      this.logger.log(`Released ${result.released} expired pending checkout reservation(s)`);
    }
  }
}
