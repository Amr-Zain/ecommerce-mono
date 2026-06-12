import { Module } from '@nestjs/common';
import { SLIDERS_REPOSITORY } from '@/common/interfaces';
import { SlidersRepository } from './sliders.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: SLIDERS_REPOSITORY,
      useClass: SlidersRepository,
    },
  ],
  exports: [SLIDERS_REPOSITORY],
})
export class SlidersModule {}
