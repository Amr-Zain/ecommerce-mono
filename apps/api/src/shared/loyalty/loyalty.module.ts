import { Module } from '@nestjs/common';
import { MediaModule } from '@/media/media.module';
import { NotificationModule } from '@/shared/notifications/notification.module';
import { SettingsModule } from '@/shared/settings/settings.module';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyRepository } from './loyalty.repository';
import { LoyaltyEventsListener } from './loyalty-events.listener';

@Module({
  imports: [MediaModule, NotificationModule, SettingsModule],
  providers: [LoyaltyService, LoyaltyRepository, LoyaltyEventsListener],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
