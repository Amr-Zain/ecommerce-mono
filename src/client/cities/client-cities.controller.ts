import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientCitiesService } from './client-cities.service';

@ApiContext('client')
@Controller('cities')
export class ClientCitiesController {
  constructor(private readonly citiesService: ClientCitiesService) {}

  @Public()
  @Get()
  findAll(@Query('countryId') countryId?: string) {
    return this.citiesService.findAll(countryId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citiesService.findOne(BigInt(id));
  }
}