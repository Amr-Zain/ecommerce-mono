import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IdempotentEventConsumer } from '@/common/events/idempotent-event-consumer.service';
import type { DomainEvent } from '@/common/events/domain-event';
import { SearchDocumentRepository } from './search-document.repository';
import { SearchElasticClient } from './search-elastic.client';
import { SearchIndexService } from './search-index.service';
import type { CatalogChangePayload } from './search.types';

@Injectable()
export class SearchIndexSyncListener {
  private readonly logger = new Logger(SearchIndexSyncListener.name);
  private readonly consumerName = 'elasticsearch-catalog-index-v1';

  constructor(
    private readonly idempotency: IdempotentEventConsumer,
    private readonly elastic: SearchElasticClient,
    private readonly documents: SearchDocumentRepository,
    private readonly index: SearchIndexService,
  ) {}

  @OnEvent('catalog.entity_changed', { async: true })
  async handle(event: DomainEvent<CatalogChangePayload>) {
    if (!this.elastic.enabled) return;
    await this.idempotency.run(event, this.consumerName, async () => {
      const change = event.payload;
      if (change.entity === 'collection') {
        await this.index.syncCollections([BigInt(change.collectionId ?? change.entityId)]);
      } else if (change.entity === 'media' && change.model === 'collection' && change.modelId) {
        await this.index.syncCollections([BigInt(change.modelId)]);
      }
      const productIds = await this.documents.affectedProductIds(change);
      await this.index.syncProducts(productIds);
      this.logger.debug(`Synchronized ${change.entity}:${change.entityId} to Elasticsearch`);
    });
  }
}
