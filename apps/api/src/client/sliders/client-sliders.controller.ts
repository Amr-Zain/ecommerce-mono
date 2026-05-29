import { Controller, Get } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientSlidersService } from './client-sliders.service';

@ApiContext('client')
@Controller('sliders')
export class ClientSlidersController {
  constructor(private readonly slidersService: ClientSlidersService) {}

  @Public()
  @Get()
  findAll(@I18nLang() lang: string) {
    return this.slidersService.findAll(lang);
  }
}