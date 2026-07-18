import { Injectable } from '@nestjs/common';
import { OrderLifecycleRepository } from './order-lifecycle.repository';

@Injectable()
export class OrderLifecycleService {
  constructor(private readonly repository: OrderLifecycleRepository) {}

  paymentSummary(...args: Parameters<OrderLifecycleRepository['paymentSummary']>) {
    return this.repository.paymentSummary(...args);
  }
  cancelOrder(...args: Parameters<OrderLifecycleRepository['cancelOrder']>) {
    return this.repository.cancelOrder(...args);
  }
  retryCancellationRefund(...args: Parameters<OrderLifecycleRepository['retryCancellationRefund']>) {
    return this.repository.retryCancellationRefund(...args);
  }
  syncOrderPaymentStatus(...args: Parameters<OrderLifecycleRepository['syncOrderPaymentStatus']>) {
    return this.repository.syncOrderPaymentStatus(...args);
  }
  assertRemainingRefundCapacity(...args: Parameters<OrderLifecycleRepository['assertRemainingRefundCapacity']>) {
    return this.repository.assertRemainingRefundCapacity(...args);
  }
  assertRemainingRefundCapacityTx(...args: Parameters<OrderLifecycleRepository['assertRemainingRefundCapacityTx']>) {
    return this.repository.assertRemainingRefundCapacityTx(...args);
  }
  createStatusHistory(...args: Parameters<OrderLifecycleRepository['createStatusHistory']>) {
    return this.repository.createStatusHistory(...args);
  }
}
