import { Controller, Get, Param, Query } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientCollectionsService } from './client-collections.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Collections')
@Controller('collections')
export class ClientCollectionsController {
  constructor(private readonly collectionsService: ClientCollectionsService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'parentId', required: false, example: '1' })
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
