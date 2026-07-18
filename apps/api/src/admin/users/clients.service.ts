import { Injectable } from '@nestjs/common';
import { UserQueryDto } from './dto/user-query.dto';
import { CustomerInsightsQueryRepository } from './customer-insights-query.repository';

@Injectable()
export class ClientsService {
  constructor(private readonly customerInsights: CustomerInsightsQueryRepository) {}

  findAll(query: UserQueryDto, langId = 'en') {
    return this.customerInsights.findAll(query, langId);
  }

  findOne(id: bigint) {
    return this.customerInsights.findOne(id);
  }
}
