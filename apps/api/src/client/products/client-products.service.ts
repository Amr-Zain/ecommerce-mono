import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { PRODUCTS_REPOSITORY, IProductsRepository } from '@/common/interfaces';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { CatalogSearchService } from '@/search/catalog-search.service';

@Injectable()
export class ClientProductsService {
  private readonly logger = new Logger(ClientProductsService.name);

  constructor(
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepo: IProductsRepository,
    private readonly catalogSearch: CatalogSearchService,
  ) {}

  async findAll(query: CatalogQueryDto, langId: string = 'en') {
    if (this.catalogSearch.enabled) {
      try {
        return await this.catalogSearch.findCatalog(query, langId);
      } catch (error) {
        this.logger.warn(
          `Elasticsearch catalog unavailable; using PostgreSQL fallback: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    return this.productsRepo.findCatalog(query, langId);
  }

  async findOne(id: bigint, langId: string = 'en') {
    const product = await this.productsRepo.findStorefrontDetail(id, langId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findRelated(id: bigint, langId: string = 'en', limit: number = 8) {
    const normalizedLimit = Math.min(Math.max(limit, 1), 20);
    return this.productsRepo.findRelated(id, langId, normalizedLimit);
  }
}
