import { Module } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { FaqsModule as CoreFaqsModule } from '@/core/faqs/faqs.module';

@Module({
  imports: [CoreFaqsModule],
  controllers: [FaqsController],
  providers: [FaqsService],
  exports: [FaqsService],
})
export class FaqsModule {}
