import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class SearchElasticClient implements OnModuleDestroy {
  readonly enabled: boolean;
  readonly indexPrefix: string;
  readonly productsReadAlias: string;
  readonly productsWriteAlias: string;
  readonly collectionsReadAlias: string;
  readonly collectionsWriteAlias: string;
  readonly client: Client | null;
  readonly queryRequestOptions: { requestTimeout: number };

  constructor(config: ConfigService) {
    this.enabled = config.get<boolean>('search.enabled') ?? false;
    this.indexPrefix = config.get<string>('search.indexPrefix') ?? 'ecommerce';
    this.productsReadAlias = `${this.indexPrefix}-products-read`;
    this.productsWriteAlias = `${this.indexPrefix}-products-write`;
    this.collectionsReadAlias = `${this.indexPrefix}-collections-read`;
    this.collectionsWriteAlias = `${this.indexPrefix}-collections-write`;
    this.queryRequestOptions = {
      requestTimeout: config.get<number>('search.requestTimeout') ?? 700,
    };

    if (!this.enabled) {
      this.client = null;
      return;
    }

    const apiKey = config.get<string>('search.apiKey');
    const username = config.get<string>('search.username');
    const password = config.get<string>('search.password');
    this.client = new Client({
      node: config.get<string>('search.node') ?? 'http://localhost:9200',
      auth: apiKey ? { apiKey } : username && password ? { username, password } : undefined,
      // Administrative index and bulk operations need a much larger deadline.
      // Storefront queries apply queryRequestOptions explicitly below this client.
      requestTimeout: 30_000,
      maxRetries: config.get<number>('search.maxRetries') ?? 1,
    });
  }

  requireClient() {
    if (!this.client) throw new Error('Elasticsearch is disabled');
    return this.client;
  }

  async isAvailable() {
    if (!this.client) return false;
    try {
      return await this.client.ping();
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    await this.client?.close();
  }
}
