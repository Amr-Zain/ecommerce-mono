import { Controller, Get, Param, Query } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientCitiesService } from './client-cities.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Cities')
@Controller('cities')
export class ClientCitiesController {
  constructor(private readonly citiesService: ClientCitiesService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'countryId', required: false, example: '1' })
  findAll(@Query('countryId') countryId?: string, @I18nLang() lang?: string) {
    return this.citiesService.findAll(lang || 'en', countryId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @I18nLang() lang?: string) {
    return this.citiesService.findOne(BigInt(id), lang || 'en');
  }
}
