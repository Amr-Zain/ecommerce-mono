import { Controller, Get } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientFaqsService } from './client-faqs.service';

@ApiContext('client')
@Controller('faqs')
export class ClientFaqsController {
  constructor(private readonly faqsService: ClientFaqsService) {}

  @Public()
  @Get()
  findAll(@I18nLang() lang: string) {
    return this.faqsService.findAll(lang);
  }
}
