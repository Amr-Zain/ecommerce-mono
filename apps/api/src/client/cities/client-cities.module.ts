import { Module } from '@nestjs/common';
import { ClientCitiesController } from './client-cities.controller';
import { ClientCitiesService } from './client-cities.service';
import { CitiesModule as CoreCitiesModule } from '@/core/cities/cities.module';

@Module({
  imports: [CoreCitiesModule],
  controllers: [ClientCitiesController],
  providers: [ClientCitiesService],
})
export class ClientCitiesModule {}
