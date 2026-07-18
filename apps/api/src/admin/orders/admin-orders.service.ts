import { Injectable } from '@nestjs/common';
import { AdminOrdersRepository } from './admin-orders.repository';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly repository: AdminOrdersRepository) {}

  findAll(...args: Parameters<AdminOrdersRepository['findAll']>) {
    return this.repository.findAll(...args);
  }
  findOne(...args: Parameters<AdminOrdersRepository['findOne']>) {
    return this.repository.findOne(...args);
  }
  updateStatus(...args: Parameters<AdminOrdersRepository['updateStatus']>) {
    return this.repository.updateStatus(...args);
  }
  confirmPayment(...args: Parameters<AdminOrdersRepository['confirmPayment']>) {
    return this.repository.confirmPayment(...args);
  }
  retryCancellationRefund(...args: Parameters<AdminOrdersRepository['retryCancellationRefund']>) {
    return this.repository.retryCancellationRefund(...args);
  }
}
