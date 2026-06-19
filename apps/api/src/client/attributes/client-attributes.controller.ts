import { Controller, Get, Param } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientAttributesService } from './client-attributes.service';
import { ApiTags } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Attributes')
@Controller('attributes')
export class ClientAttributesController {
  constructor(private readonly attributesService: ClientAttributesService) {}

  @Public()
  @Get()
  findAll(@I18nLang() lang: string) {
    return this.attributesService.findAll(lang);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(+id);
  }
}
