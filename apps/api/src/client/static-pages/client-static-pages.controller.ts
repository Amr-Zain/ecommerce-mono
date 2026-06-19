import { Controller, Get, Param } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientStaticPagesService } from './client-static-pages.service';
import { ApiTags } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Static-pages')
@Controller('static-pages')
export class ClientStaticPagesController {
  constructor(private readonly staticPagesService: ClientStaticPagesService) {}

  @Public()
  @Get()
  findAll(@I18nLang() lang: string) {
    return this.staticPagesService.findAll(lang);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string, @I18nLang() lang: string) {
    return this.staticPagesService.findBySlug(slug, lang);
  }
}
