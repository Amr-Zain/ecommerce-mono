import { Module } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { CountriesModule as CoreCountriesModule } from '@/core/countries/countries.module';

@Module({
  imports: [CoreCountriesModule],
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
