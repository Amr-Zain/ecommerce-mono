import { Injectable } from '@nestjs/common';
import { ProductAnalyticsQueryRepository } from './product-analytics-query.repository';

@Injectable()
export class ProductStatisticsService {
  constructor(private readonly analytics: ProductAnalyticsQueryRepository) {}

  get(productId: number | bigint) {
    return this.analytics.get(productId);
  }
}
