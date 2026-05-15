import { Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { CitiesRepository } from './cities.repository';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService, CitiesRepository],
})
export class CitiesModule {}
