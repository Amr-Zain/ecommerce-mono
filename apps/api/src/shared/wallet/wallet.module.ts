import { Module } from '@nestjs/common';
import { PaymentModule } from '@/shared/payment/payment.module';
import { WalletService } from './wallet.service';
import { WalletRepository } from './wallet.repository';
import { WalletWorkflowRepository } from './wallet-workflow.repository';

@Module({
  imports: [PaymentModule],
  providers: [WalletService, WalletWorkflowRepository, WalletRepository],
  exports: [WalletService],
})
export class WalletModule {}
