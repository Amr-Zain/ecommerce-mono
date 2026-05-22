import { Module } from '@nestjs/common';
import { ClientFaqsController } from './client-faqs.controller';
import { ClientFaqsService } from './client-faqs.service';
import { FaqsModule as CoreFaqsModule } from '@/core/faqs/faqs.module';

@Module({
  imports: [CoreFaqsModule],
  controllers: [ClientFaqsController],
  providers: [ClientFaqsService],
})
export class ClientFaqsModule {}