import { Injectable } from '@nestjs/common';
import { WalletWorkflowRepository } from './wallet-workflow.repository';

@Injectable()
export class WalletService {
  constructor(private readonly repository: WalletWorkflowRepository) {}

  getClientWallet(...args: Parameters<WalletWorkflowRepository['getClientWallet']>) {
    return this.repository.getClientWallet(...args);
  }
  reserveForCheckout(...args: Parameters<WalletWorkflowRepository['reserveForCheckout']>) {
    return this.repository.reserveForCheckout(...args);
  }
  captureCheckoutHold(...args: Parameters<WalletWorkflowRepository['captureCheckoutHold']>) {
    return this.repository.captureCheckoutHold(...args);
  }
  releaseCheckoutHold(...args: Parameters<WalletWorkflowRepository['releaseCheckoutHold']>) {
    return this.repository.releaseCheckoutHold(...args);
  }
  debitForOrder(...args: Parameters<WalletWorkflowRepository['debitForOrder']>) {
    return this.repository.debitForOrder(...args);
  }
  creditRefund(...args: Parameters<WalletWorkflowRepository['creditRefund']>) {
    return this.repository.creditRefund(...args);
  }
  createDeposit(...args: Parameters<WalletWorkflowRepository['createDeposit']>) {
    return this.repository.createDeposit(...args);
  }
  getClientDeposit(...args: Parameters<WalletWorkflowRepository['getClientDeposit']>) {
    return this.repository.getClientDeposit(...args);
  }
  verifyClientDeposit(...args: Parameters<WalletWorkflowRepository['verifyClientDeposit']>) {
    return this.repository.verifyClientDeposit(...args);
  }
  cancelClientDeposit(...args: Parameters<WalletWorkflowRepository['cancelClientDeposit']>) {
    return this.repository.cancelClientDeposit(...args);
  }
  completeDepositTransaction(...args: Parameters<WalletWorkflowRepository['completeDepositTransaction']>) {
    return this.repository.completeDepositTransaction(...args);
  }
  markDepositFailedByTransactionRef(
    ...args: Parameters<WalletWorkflowRepository['markDepositFailedByTransactionRef']>
  ) {
    return this.repository.markDepositFailedByTransactionRef(...args);
  }
  createWithdrawal(...args: Parameters<WalletWorkflowRepository['createWithdrawal']>) {
    return this.repository.createWithdrawal(...args);
  }
  cancelClientWithdrawal(...args: Parameters<WalletWorkflowRepository['cancelClientWithdrawal']>) {
    return this.repository.cancelClientWithdrawal(...args);
  }
  approveWithdrawal(...args: Parameters<WalletWorkflowRepository['approveWithdrawal']>) {
    return this.repository.approveWithdrawal(...args);
  }
  markWithdrawalPaid(...args: Parameters<WalletWorkflowRepository['markWithdrawalPaid']>) {
    return this.repository.markWithdrawalPaid(...args);
  }
  rejectWithdrawal(...args: Parameters<WalletWorkflowRepository['rejectWithdrawal']>) {
    return this.repository.rejectWithdrawal(...args);
  }
  failWithdrawal(...args: Parameters<WalletWorkflowRepository['failWithdrawal']>) {
    return this.repository.failWithdrawal(...args);
  }
  listClientTransactions(...args: Parameters<WalletWorkflowRepository['listClientTransactions']>) {
    return this.repository.listClientTransactions(...args);
  }
  listAdminTransactions(...args: Parameters<WalletWorkflowRepository['listAdminTransactions']>) {
    return this.repository.listAdminTransactions(...args);
  }
  listClientWithdrawals(...args: Parameters<WalletWorkflowRepository['listClientWithdrawals']>) {
    return this.repository.listClientWithdrawals(...args);
  }
  listAdminWithdrawals(...args: Parameters<WalletWorkflowRepository['listAdminWithdrawals']>) {
    return this.repository.listAdminWithdrawals(...args);
  }
  getClientWithdrawal(...args: Parameters<WalletWorkflowRepository['getClientWithdrawal']>) {
    return this.repository.getClientWithdrawal(...args);
  }
  getAdminWithdrawal(...args: Parameters<WalletWorkflowRepository['getAdminWithdrawal']>) {
    return this.repository.getAdminWithdrawal(...args);
  }
  listAdminWallets(...args: Parameters<WalletWorkflowRepository['listAdminWallets']>) {
    return this.repository.listAdminWallets(...args);
  }
  getAdminWallet(...args: Parameters<WalletWorkflowRepository['getAdminWallet']>) {
    return this.repository.getAdminWallet(...args);
  }
}
