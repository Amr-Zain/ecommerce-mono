import { Module } from '@nestjs/common';
import { ClientCountriesController } from './client-countries.controller';
import { ClientCountriesService } from './client-countries.service';
import { CountriesModule as CoreCountriesModule } from '@/core/countries/countries.module';

@Module({
  imports: [CoreCountriesModule],
  controllers: [ClientCountriesController],
  providers: [ClientCountriesService],
})
export class ClientCountriesModule {}
