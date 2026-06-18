import { Module } from '@nestjs/common';
import { TicketsModule } from '@/core/tickets/tickets.module';
import { ClientTicketsController } from './client-tickets.controller';

@Module({
  imports: [TicketsModule],
  controllers: [ClientTicketsController],
})
export class ClientTicketsModule {}
