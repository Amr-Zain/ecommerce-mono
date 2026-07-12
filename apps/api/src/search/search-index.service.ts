import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchElasticClient } from './search-elastic.client';
import { SearchDocumentRepository } from './search-document.repository';
import { collectionSearchMapping, productSearchMapping, searchIndexSettings } from './search.mappings';
import type { SearchCollectionDocument, SearchProductDocument } from './search.types';
import type { estypes } from '@elastic/elasticsearch';

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);
  private readonly adminRequestOptions = { requestTimeout: 30_000 } as const;
  private readonly replicas: number;

  constructor(
    private readonly elastic: SearchElasticClient,
    private readonly documents: SearchDocumentRepository,
    config: ConfigService,
  ) {
    this.replicas = config.get<number>('search.replicas') ?? 0;
  }

  async rebuild() {
    const client = this.elastic.requireClient();
    const suffix = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const productsIndex = `${this.elastic.indexPrefix}-products-${suffix}`;
    const collectionsIndex = `${this.elastic.indexPrefix}-collections-${suffix}`;
    this.logger.log(`Building search indices ${productsIndex} and ${collectionsIndex}`);

    await client.indices.create(
      {
        index: productsIndex,
        settings: searchIndexSettings(this.replicas) as estypes.IndicesIndexSettings,
        mappings: productSearchMapping as estypes.MappingTypeMapping,
      },
      this.adminRequestOptions,
    );
    await client.indices.create(
      {
        index: collectionsIndex,
        settings: searchIndexSettings(this.replicas) as estypes.IndicesIndexSettings,
        mappings: collectionSearchMapping as estypes.MappingTypeMapping,
      },
      this.adminRequestOptions,
    );

    try {
      const [products, collections] = await Promise.all([
        this.documents.productDocuments(),
        this.documents.collectionDocuments(),
      ]);
      await Promise.all([this.bulkIndex(productsIndex, products), this.bulkIndex(collectionsIndex, collections)]);
      await Promise.all([
        client.indices.refresh({ index: productsIndex }, this.adminRequestOptions),
        client.indices.refresh({ index: collectionsIndex }, this.adminRequestOptions),
      ]);
      const [productCount, collectionCount] = await Promise.all([
        client.count({ index: productsIndex }, this.adminRequestOptions),
        client.count({ index: collectionsIndex }, this.adminRequestOptions),
      ]);
      if (productCount.count !== products.length || collectionCount.count !== collections.length) {
        throw new Error(
          `Search index validation failed: products ${productCount.count}/${products.length}, collections ${collectionCount.count}/${collections.length}`,
        );
      }
      await this.swapAliases(productsIndex, collectionsIndex);
      this.logger.log(`Search rebuild complete: ${products.length} products, ${collections.length} collections`);
      return { productsIndex, collectionsIndex, products: products.length, collections: collections.length };
    } catch (error) {
      await client.indices.delete(
        { index: [productsIndex, collectionsIndex], ignore_unavailable: true },
        this.adminRequestOptions,
      );
      throw error;
    }
  }

  async syncProducts(ids: bigint[]) {
    if (!this.elastic.enabled || ids.length === 0) return;
    const client = this.elastic.requireClient();
    const uniqueIds = [...new Set(ids.map(String))];
    const products = await this.documents.productDocuments(uniqueIds.map(BigInt));
    const found = new Set(products.map((item) => item.id));
    const operations: Array<Record<string, unknown>> = [];
    for (const product of products) {
      operations.push({ index: { _index: this.elastic.productsWriteAlias, _id: product.id } }, product);
    }
    for (const id of uniqueIds.filter((item) => !found.has(item))) {
      operations.push({ delete: { _index: this.elastic.productsWriteAlias, _id: id } });
    }
    if (operations.length) await client.bulk({ operations, refresh: false }, this.adminRequestOptions);
  }

  async syncCollections(ids?: bigint[]) {
    if (!this.elastic.enabled) return;
    const client = this.elastic.requireClient();
    const collections = await this.documents.collectionDocuments(ids);
    const operations: Array<Record<string, unknown>> = [];
    for (const collection of collections) {
      operations.push({ index: { _index: this.elastic.collectionsWriteAlias, _id: collection.id } }, collection);
    }
    if (ids) {
      const found = new Set(collections.map((item) => item.id));
      for (const id of ids.map(String).filter((item) => !found.has(item))) {
        operations.push({ delete: { _index: this.elastic.collectionsWriteAlias, _id: id } });
      }
    }
    if (operations.length) await client.bulk({ operations, refresh: false }, this.adminRequestOptions);
  }

  async status() {
    const available = await this.elastic.isAvailable();
    if (!available) return { enabled: this.elastic.enabled, available: false, aliases: {}, counts: {} };
    const client = this.elastic.requireClient();
    const [aliases, productCount, collectionCount] = await Promise.all([
      client.indices.getAlias({
        name: [this.elastic.productsReadAlias, this.elastic.collectionsReadAlias],
        ignore_unavailable: true,
      }),
      client.count({ index: this.elastic.productsReadAlias }).catch(() => ({ count: 0 })),
      client.count({ index: this.elastic.collectionsReadAlias }).catch(() => ({ count: 0 })),
    ]);
    return {
      enabled: true,
      available: true,
      aliases: Object.keys(aliases),
      counts: { products: productCount.count, collections: collectionCount.count },
    };
  }

  private async bulkIndex(index: string, documents: Array<SearchProductDocument | SearchCollectionDocument>) {
    if (documents.length === 0) return;
    const operations = documents.flatMap((document) => [{ index: { _index: index, _id: document.id } }, document]);
    const result = await this.elastic.requireClient().bulk({ operations, refresh: false }, this.adminRequestOptions);
    if (result.errors) {
      const failures = result.items.filter((item) => {
        const action = item.index ?? item.create ?? item.update ?? item.delete;
        return action?.error;
      });
      throw new Error(`Bulk indexing failed for ${failures.length} documents`);
    }
  }

  private async swapAliases(productsIndex: string, collectionsIndex: string) {
    const client = this.elastic.requireClient();
    const current = await client.indices
      .getAlias({
        name: [
          this.elastic.productsReadAlias,
          this.elastic.productsWriteAlias,
          this.elastic.collectionsReadAlias,
          this.elastic.collectionsWriteAlias,
        ],
        ignore_unavailable: true,
      })
      .catch(() => ({}));
    const actions: Array<Record<string, unknown>> = [];
    for (const [index, value] of Object.entries(current)) {
      const aliases = Object.keys(value.aliases ?? {});
      for (const alias of aliases) actions.push({ remove: { index, alias } });
    }
    actions.push(
      { add: { index: productsIndex, alias: this.elastic.productsReadAlias } },
      { add: { index: productsIndex, alias: this.elastic.productsWriteAlias, is_write_index: true } },
      { add: { index: collectionsIndex, alias: this.elastic.collectionsReadAlias } },
      { add: { index: collectionsIndex, alias: this.elastic.collectionsWriteAlias, is_write_index: true } },
    );
    await client.indices.updateAliases({ actions }, this.adminRequestOptions);
  }
}
