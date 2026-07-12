import { Controller, Get } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientHomeService } from './client-home.service';
import { ApiTags } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Home')
@Controller('home')
export class ClientHomeController {
  constructor(private readonly homeService: ClientHomeService) {}

  @Public()
  @Get()
  getHomePage(@I18nLang() lang: string) {
    return this.homeService.getHomePage(lang);
  }

  @Public()
  @Get('storefront')
  getStorefrontConfiguration(@I18nLang() lang: string) {
    return this.homeService.getStorefrontConfiguration(lang);
  }
}
