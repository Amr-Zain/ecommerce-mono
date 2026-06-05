import { Module } from '@nestjs/common';
import { WalletModule } from '@/shared/wallet/wallet.module';
import { ClientWalletController } from './client-wallet.controller';

@Module({
  imports: [WalletModule],
  controllers: [ClientWalletController],
})
export class ClientWalletModule {}
