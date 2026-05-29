import { Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { CitiesModule as CoreCitiesModule } from '@/core/cities/cities.module';

@Module({
  imports: [CoreCitiesModule],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}