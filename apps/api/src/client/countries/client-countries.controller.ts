import { Controller, Get, Param } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientCountriesService } from './client-countries.service';

@ApiContext('client')
@Controller('countries')
export class ClientCountriesController {
  constructor(private readonly countriesService: ClientCountriesService) {}

  @Public()
  @Get()
  findAll(@I18nLang() lang: string) {
    return this.countriesService.findAll(lang);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @I18nLang() lang: string) {
    return this.countriesService.findOne(BigInt(id), lang);
  }
}