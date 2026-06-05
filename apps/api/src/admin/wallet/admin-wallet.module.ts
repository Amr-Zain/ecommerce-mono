import { Module } from '@nestjs/common';
import { WalletModule } from '@/shared/wallet/wallet.module';
import { AdminWalletController } from './admin-wallet.controller';

@Module({
  imports: [WalletModule],
  controllers: [AdminWalletController],
})
export class AdminWalletModule {}
