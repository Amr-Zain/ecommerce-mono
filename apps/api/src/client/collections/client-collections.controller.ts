import { Controller, Get, Param, Query } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientCollectionsService } from './client-collections.service';

@ApiContext('client')
@Controller('collections')
export class ClientCollectionsController {
  constructor(private readonly collectionsService: ClientCollectionsService) {}

  @Public()
  @Get()
  findAll(@Query('parentId') parentId?: string, @I18nLang() lang?: string) {
    return this.collectionsService.findAll(lang || 'en', parentId);
  }

  @Public()
  @Get('tree')
  tree(@I18nLang() lang?: string) {
    return this.collectionsService.tree(lang || 'en');
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @I18nLang() lang?: string) {
    return this.collectionsService.findBySlug(slug, lang || 'en');
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(+id);
  }
}
