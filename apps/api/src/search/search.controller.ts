import { Controller, Get, Query } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { CatalogSearchService } from './catalog-search.service';
import { SearchSuggestionsDto } from './dto/search-suggestions.dto';

@ApiContext('client')
@ApiTags('Client - Search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: CatalogSearchService) {}

  @Public()
  @Get('suggestions')
  suggestions(@Query() query: SearchSuggestionsDto, @I18nLang() lang: string) {
    return this.search.suggestions(query.q, query.limit, lang);
  }
}
