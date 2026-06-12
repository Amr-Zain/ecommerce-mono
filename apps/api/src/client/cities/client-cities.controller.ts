import { Controller, Get, Param, Query } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientCitiesService } from './client-cities.service';

@ApiContext('client')
@Controller('cities')
export class ClientCitiesController {
  constructor(private readonly citiesService: ClientCitiesService) {}

  @Public()
  @Get()
  findAll(@Query('countryId') countryId?: string, @I18nLang() lang?: string) {
    return this.citiesService.findAll(lang || 'en', countryId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @I18nLang() lang?: string) {
    return this.citiesService.findOne(BigInt(id), lang || 'en');
  }
}
