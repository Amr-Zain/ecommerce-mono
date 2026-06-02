import { Injectable } from '@nestjs/common';
import {
  PaymentStrategy,
  PaymentInitResult,
  PaymentVerifyResult,
  PaymentRefundResult,
  PaymentCancelResult,
  PaymentGatewayData,
} from '../interfaces/payment.interfaces';
import { randomBytes } from 'crypto';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { PAYMENT_METHODS, PAYMENT_REFERENCE_PREFIXES, PAYMENT_STATUSES } from '../payment.constants';

@Injectable()
export class BankTransferStrategy implements PaymentStrategy {
  readonly methodName = PAYMENT_METHODS.bankTransfer;

  constructor(private readonly i18n: I18nService<I18nTranslations>) {}

  async initiate(referenceId: string, amount: number): Promise<PaymentInitResult> {
    const transactionRef = `${PAYMENT_REFERENCE_PREFIXES.bankTransfer}_${randomBytes(8).toString('hex')}`;
    return {
      transactionRef,
      status: PAYMENT_STATUSES.awaitingConfirmation,
      gatewayResponse: { message: this.i18n.t('errors.payment_bank_transfer_awaiting_admin') },
    };
  }

  async verify(transactionRef: string, gatewayData: PaymentGatewayData): Promise<PaymentVerifyResult> {
    return {
      status: PAYMENT_STATUSES.completed,
      gatewayResponse: { ...gatewayData, message: this.i18n.t('errors.payment_bank_transfer_verified') },
    };
  }

  async refund(transactionRef: string, amount: number): Promise<PaymentRefundResult> {
    return {
      status: PAYMENT_STATUSES.refunded,
      gatewayResponse: { message: this.i18n.t('errors.payment_bank_transfer_refund_completed') },
    };
  }

  async cancel(transactionRef: string): Promise<PaymentCancelResult> {
    return {
      status: PAYMENT_STATUSES.failed,
      gatewayResponse: { transactionRef },
    };
  }
}
