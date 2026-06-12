import { Module } from '@nestjs/common';
import { FAQS_REPOSITORY } from '@/common/interfaces';
import { FaqsRepository } from './faqs.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: FAQS_REPOSITORY,
      useClass: FaqsRepository,
    },
  ],
  exports: [FAQS_REPOSITORY],
})
export class FaqsModule {}
