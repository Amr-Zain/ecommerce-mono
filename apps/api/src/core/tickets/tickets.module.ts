import { Module } from '@nestjs/common';
import { NotificationModule } from '@/shared/notifications/notification.module';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';

@Module({
  imports: [NotificationModule],
  providers: [TicketsService, TicketsRepository],
  exports: [TicketsService],
})
export class TicketsModule {}
