import { Injectable } from '@nestjs/common';
import { StripeWebhookRepository } from './stripe-webhook.repository';

@Injectable()
export class StripeWebhookService {
  constructor(private readonly repository: StripeWebhookRepository) {}

  constructEvent(...args: Parameters<StripeWebhookRepository['constructEvent']>) {
    return this.repository.constructEvent(...args);
  }
  verifyPendingCheckoutAndCreateOrder(
    ...args: Parameters<StripeWebhookRepository['verifyPendingCheckoutAndCreateOrder']>
  ) {
    return this.repository.verifyPendingCheckoutAndCreateOrder(...args);
  }
  releaseExpiredPendingCheckouts(...args: Parameters<StripeWebhookRepository['releaseExpiredPendingCheckouts']>) {
    return this.repository.releaseExpiredPendingCheckouts(...args);
  }
  completePendingCheckoutFromProvider(
    ...args: Parameters<StripeWebhookRepository['completePendingCheckoutFromProvider']>
  ) {
    return this.repository.completePendingCheckoutFromProvider(...args);
  }
  releasePendingCheckoutFromProvider(
    ...args: Parameters<StripeWebhookRepository['releasePendingCheckoutFromProvider']>
  ) {
    return this.repository.releasePendingCheckoutFromProvider(...args);
  }
  handleEvent(...args: Parameters<StripeWebhookRepository['handleEvent']>) {
    return this.repository.handleEvent(...args);
  }
}
