import { Module } from '@nestjs/common';
import { LoyaltyModule } from '@/shared/loyalty/loyalty.module';
import { SettingsModule } from '@/shared/settings/settings.module';
import { AdminEarningRulesController } from './earning-rules.controller';
import { AdminRewardsController } from './rewards.controller';
import { AdminTiersController } from './tiers.controller';
import { AdminSettingsController } from './settings.controller';

@Module({
  imports: [LoyaltyModule, SettingsModule],
  controllers: [AdminEarningRulesController, AdminRewardsController, AdminTiersController, AdminSettingsController],
})
export class AdminLoyaltyModule {}
