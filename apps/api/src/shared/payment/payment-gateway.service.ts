import { Injectable } from '@nestjs/common';
import { PaymentGatewayRepository } from './payment-gateway.repository';

export type { RuntimePaymentGateway } from './payment-gateway.repository';

@Injectable()
export class PaymentGatewayService {
  constructor(private readonly repository: PaymentGatewayRepository) {}

  ensureDefaultGateways(...args: Parameters<PaymentGatewayRepository['ensureDefaultGateways']>) {
    return this.repository.ensureDefaultGateways(...args);
  }
  listAdmin(...args: Parameters<PaymentGatewayRepository['listAdmin']>) {
    return this.repository.listAdmin(...args);
  }
  getAdmin(...args: Parameters<PaymentGatewayRepository['getAdmin']>) {
    return this.repository.getAdmin(...args);
  }
  updateAdmin(...args: Parameters<PaymentGatewayRepository['updateAdmin']>) {
    return this.repository.updateAdmin(...args);
  }
  listClientPaymentMethods(...args: Parameters<PaymentGatewayRepository['listClientPaymentMethods']>) {
    return this.repository.listClientPaymentMethods(...args);
  }
  resolveGatewayForPayment(...args: Parameters<PaymentGatewayRepository['resolveGatewayForPayment']>) {
    return this.repository.resolveGatewayForPayment(...args);
  }
  getRuntimeGateway(...args: Parameters<PaymentGatewayRepository['getRuntimeGateway']>) {
    return this.repository.getRuntimeGateway(...args);
  }
  getRuntimeGatewayByProvider(...args: Parameters<PaymentGatewayRepository['getRuntimeGatewayByProvider']>) {
    return this.repository.getRuntimeGatewayByProvider(...args);
  }
  recordInitiation(...args: Parameters<PaymentGatewayRepository['recordInitiation']>) {
    return this.repository.recordInitiation(...args);
  }
  updateSessionStatus(...args: Parameters<PaymentGatewayRepository['updateSessionStatus']>) {
    return this.repository.updateSessionStatus(...args);
  }
  findSessionByTransactionRef(...args: Parameters<PaymentGatewayRepository['findSessionByTransactionRef']>) {
    return this.repository.findSessionByTransactionRef(...args);
  }
  listSessionsAdmin(...args: Parameters<PaymentGatewayRepository['listSessionsAdmin']>) {
    return this.repository.listSessionsAdmin(...args);
  }
  listSessionsAdminLegacy(...args: Parameters<PaymentGatewayRepository['listSessionsAdminLegacy']>) {
    return this.repository.listSessionsAdminLegacy(...args);
  }
  getSessionAdmin(...args: Parameters<PaymentGatewayRepository['getSessionAdmin']>) {
    return this.repository.getSessionAdmin(...args);
  }
  formatAdminGateway(...args: Parameters<PaymentGatewayRepository['formatAdminGateway']>) {
    return this.repository.formatAdminGateway(...args);
  }
}
