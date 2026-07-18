import { Injectable } from '@nestjs/common';
import { ClientCheckoutRepository } from './client-checkout.repository';

@Injectable()
export class ClientCheckoutService {
  constructor(private readonly repository: ClientCheckoutRepository) {}

  validateCoupon(...args: Parameters<ClientCheckoutRepository['validateCoupon']>) {
    return this.repository.validateCoupon(...args);
  }
  calculateCouponDiscount(...args: Parameters<ClientCheckoutRepository['calculateCouponDiscount']>) {
    return this.repository.calculateCouponDiscount(...args);
  }
  previewCheckout(...args: Parameters<ClientCheckoutRepository['previewCheckout']>) {
    return this.repository.previewCheckout(...args);
  }
  initiateOnlineCheckout(...args: Parameters<ClientCheckoutRepository['initiateOnlineCheckout']>) {
    return this.repository.initiateOnlineCheckout(...args);
  }
  verifyPaymentAndCreateOrder(...args: Parameters<ClientCheckoutRepository['verifyPaymentAndCreateOrder']>) {
    return this.repository.verifyPaymentAndCreateOrder(...args);
  }
  placeOrder(...args: Parameters<ClientCheckoutRepository['placeOrder']>) {
    return this.repository.placeOrder(...args);
  }
}
