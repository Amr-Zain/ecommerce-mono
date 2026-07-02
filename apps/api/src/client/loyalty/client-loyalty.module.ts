import { Module } from '@nestjs/common';
import { LoyaltyModule } from '@/shared/loyalty/loyalty.module';
import { ClientLoyaltyController } from './client-loyalty.controller';

@Module({
  imports: [LoyaltyModule],
  controllers: [ClientLoyaltyController],
})
export class ClientLoyaltyModule {}
