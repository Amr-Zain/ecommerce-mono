import { Module } from '@nestjs/common';
import { PaymentModule } from '@/shared/payment/payment.module';
import { WalletService } from './wallet.service';
import { WalletRepository } from './wallet.repository';

@Module({
  imports: [PaymentModule],
  providers: [WalletService, WalletRepository],
  exports: [WalletService],
})
export class WalletModule {}
