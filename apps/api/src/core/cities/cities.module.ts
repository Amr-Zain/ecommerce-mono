import { Module } from '@nestjs/common';
import { CITIES_REPOSITORY } from '@/common/interfaces';
import { CitiesRepository } from './cities.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: CITIES_REPOSITORY,
      useClass: CitiesRepository,
    },
  ],
  exports: [CITIES_REPOSITORY],
})
export class CitiesModule {}
