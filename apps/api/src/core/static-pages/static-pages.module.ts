import { Module } from '@nestjs/common';
import { STATIC_PAGES_REPOSITORY } from '@/common/interfaces';
import { StaticPagesRepository } from './static-pages.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: STATIC_PAGES_REPOSITORY,
      useClass: StaticPagesRepository,
    },
  ],
  exports: [STATIC_PAGES_REPOSITORY],
})
export class StaticPagesModule {}
