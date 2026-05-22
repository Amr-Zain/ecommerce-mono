import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientCountriesService } from './client-countries.service';

@ApiContext('client')
@Controller('countries')
export class ClientCountriesController {
  constructor(private readonly countriesService: ClientCountriesService) {}

  @Public()
  @Get()
  findAll() {
    return this.countriesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countriesService.findOne(BigInt(id));
  }
}