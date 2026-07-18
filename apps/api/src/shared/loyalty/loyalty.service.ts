import { Injectable } from '@nestjs/common';
import { LoyaltyRepository } from './loyalty.repository';

@Injectable()
export class LoyaltyService {
  constructor(private readonly repository: LoyaltyRepository) {}

  listTiers(...args: Parameters<LoyaltyRepository['listTiers']>) {
    return this.repository.listTiers(...args);
  }
  getTier(...args: Parameters<LoyaltyRepository['getTier']>) {
    return this.repository.getTier(...args);
  }
  createTier(...args: Parameters<LoyaltyRepository['createTier']>) {
    return this.repository.createTier(...args);
  }
  updateTier(...args: Parameters<LoyaltyRepository['updateTier']>) {
    return this.repository.updateTier(...args);
  }
  deleteTier(...args: Parameters<LoyaltyRepository['deleteTier']>) {
    return this.repository.deleteTier(...args);
  }
  listEarningRules(...args: Parameters<LoyaltyRepository['listEarningRules']>) {
    return this.repository.listEarningRules(...args);
  }
  getEarningRule(...args: Parameters<LoyaltyRepository['getEarningRule']>) {
    return this.repository.getEarningRule(...args);
  }
  createEarningRule(...args: Parameters<LoyaltyRepository['createEarningRule']>) {
    return this.repository.createEarningRule(...args);
  }
  updateEarningRule(...args: Parameters<LoyaltyRepository['updateEarningRule']>) {
    return this.repository.updateEarningRule(...args);
  }
  deleteEarningRule(...args: Parameters<LoyaltyRepository['deleteEarningRule']>) {
    return this.repository.deleteEarningRule(...args);
  }
  listRewards(...args: Parameters<LoyaltyRepository['listRewards']>) {
    return this.repository.listRewards(...args);
  }
  getReward(...args: Parameters<LoyaltyRepository['getReward']>) {
    return this.repository.getReward(...args);
  }
  createReward(...args: Parameters<LoyaltyRepository['createReward']>) {
    return this.repository.createReward(...args);
  }
  updateReward(...args: Parameters<LoyaltyRepository['updateReward']>) {
    return this.repository.updateReward(...args);
  }
  deleteReward(...args: Parameters<LoyaltyRepository['deleteReward']>) {
    return this.repository.deleteReward(...args);
  }
  getClientSummary(...args: Parameters<LoyaltyRepository['getClientSummary']>) {
    return this.repository.getClientSummary(...args);
  }
  listClientTransactions(...args: Parameters<LoyaltyRepository['listClientTransactions']>) {
    return this.repository.listClientTransactions(...args);
  }
  previewReward(...args: Parameters<LoyaltyRepository['previewReward']>) {
    return this.repository.previewReward(...args);
  }
  reserveForCheckout(...args: Parameters<LoyaltyRepository['reserveForCheckout']>) {
    return this.repository.reserveForCheckout(...args);
  }
  captureCheckoutRedemption(...args: Parameters<LoyaltyRepository['captureCheckoutRedemption']>) {
    return this.repository.captureCheckoutRedemption(...args);
  }
  releaseCheckoutRedemption(...args: Parameters<LoyaltyRepository['releaseCheckoutRedemption']>) {
    return this.repository.releaseCheckoutRedemption(...args);
  }
  redeemForOrder(...args: Parameters<LoyaltyRepository['redeemForOrder']>) {
    return this.repository.redeemForOrder(...args);
  }
  refundOrderRedemptions(...args: Parameters<LoyaltyRepository['refundOrderRedemptions']>) {
    return this.repository.refundOrderRedemptions(...args);
  }
  awardWelcome(...args: Parameters<LoyaltyRepository['awardWelcome']>) {
    return this.repository.awardWelcome(...args);
  }
  awardReview(...args: Parameters<LoyaltyRepository['awardReview']>) {
    return this.repository.awardReview(...args);
  }
  awardPaidOrder(...args: Parameters<LoyaltyRepository['awardPaidOrder']>) {
    return this.repository.awardPaidOrder(...args);
  }
  reverseOrderEarnings(...args: Parameters<LoyaltyRepository['reverseOrderEarnings']>) {
    return this.repository.reverseOrderEarnings(...args);
  }
  reverseOrderEarningsForRefund(...args: Parameters<LoyaltyRepository['reverseOrderEarningsForRefund']>) {
    return this.repository.reverseOrderEarningsForRefund(...args);
  }
  getOrCreateAccount(...args: Parameters<LoyaltyRepository['getOrCreateAccount']>) {
    return this.repository.getOrCreateAccount(...args);
  }
}
