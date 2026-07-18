import { Injectable } from '@nestjs/common';
import { AdminReturnsRepository } from './admin-returns.repository';

@Injectable()
export class AdminReturnsService {
  constructor(private readonly repository: AdminReturnsRepository) {}

  findReturns(...args: Parameters<AdminReturnsRepository['findReturns']>) {
    return this.repository.findReturns(...args);
  }
  findReturn(...args: Parameters<AdminReturnsRepository['findReturn']>) {
    return this.repository.findReturn(...args);
  }
  findExchanges(...args: Parameters<AdminReturnsRepository['findExchanges']>) {
    return this.repository.findExchanges(...args);
  }
  findExchange(...args: Parameters<AdminReturnsRepository['findExchange']>) {
    return this.repository.findExchange(...args);
  }
  approveReturn(...args: Parameters<AdminReturnsRepository['approveReturn']>) {
    return this.repository.approveReturn(...args);
  }
  rejectReturn(...args: Parameters<AdminReturnsRepository['rejectReturn']>) {
    return this.repository.rejectReturn(...args);
  }
  receiveReturn(...args: Parameters<AdminReturnsRepository['receiveReturn']>) {
    return this.repository.receiveReturn(...args);
  }
  refundReturn(...args: Parameters<AdminReturnsRepository['refundReturn']>) {
    return this.repository.refundReturn(...args);
  }
  completeReturn(...args: Parameters<AdminReturnsRepository['completeReturn']>) {
    return this.repository.completeReturn(...args);
  }
  approveExchange(...args: Parameters<AdminReturnsRepository['approveExchange']>) {
    return this.repository.approveExchange(...args);
  }
  rejectExchange(...args: Parameters<AdminReturnsRepository['rejectExchange']>) {
    return this.repository.rejectExchange(...args);
  }
  receiveExchange(...args: Parameters<AdminReturnsRepository['receiveExchange']>) {
    return this.repository.receiveExchange(...args);
  }
  createExchangePayment(...args: Parameters<AdminReturnsRepository['createExchangePayment']>) {
    return this.repository.createExchangePayment(...args);
  }
  verifyExchangePayment(...args: Parameters<AdminReturnsRepository['verifyExchangePayment']>) {
    return this.repository.verifyExchangePayment(...args);
  }
  retryExchangeReservation(...args: Parameters<AdminReturnsRepository['retryExchangeReservation']>) {
    return this.repository.retryExchangeReservation(...args);
  }
  releaseExpiredExchangeReservations(
    ...args: Parameters<AdminReturnsRepository['releaseExpiredExchangeReservations']>
  ) {
    return this.repository.releaseExpiredExchangeReservations(...args);
  }
  refundExchangeDifference(...args: Parameters<AdminReturnsRepository['refundExchangeDifference']>) {
    return this.repository.refundExchangeDifference(...args);
  }
  shipExchange(...args: Parameters<AdminReturnsRepository['shipExchange']>) {
    return this.repository.shipExchange(...args);
  }
  completeExchange(...args: Parameters<AdminReturnsRepository['completeExchange']>) {
    return this.repository.completeExchange(...args);
  }
  waiveExchangeAdjustment(...args: Parameters<AdminReturnsRepository['waiveExchangeAdjustment']>) {
    return this.repository.waiveExchangeAdjustment(...args);
  }
}
