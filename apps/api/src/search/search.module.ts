import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import searchConfig from './search.config';
import { SearchElasticClient } from './search-elastic.client';
import { SearchDocumentRepository } from './search-document.repository';
import { SearchIndexService } from './search-index.service';
import { CatalogSearchService } from './catalog-search.service';
import { SearchIndexSyncListener } from './search-index-sync.listener';

@Global()
@Module({
  imports: [ConfigModule.forFeature(searchConfig)],
  providers: [
    SearchElasticClient,
    SearchDocumentRepository,
    SearchIndexService,
    CatalogSearchService,
    SearchIndexSyncListener,
  ],
  exports: [SearchElasticClient, SearchDocumentRepository, SearchIndexService, CatalogSearchService],
})
export class SearchModule {}
