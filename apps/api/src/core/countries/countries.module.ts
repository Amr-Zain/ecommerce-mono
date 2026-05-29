import { Module } from '@nestjs/common';
import { COUNTRIES_REPOSITORY } from '@/common/interfaces';
import { CountriesRepository } from './countries.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: COUNTRIES_REPOSITORY,
      useClass: CountriesRepository,
    },
  ],
  exports: [COUNTRIES_REPOSITORY],
})
export class CountriesModule {}