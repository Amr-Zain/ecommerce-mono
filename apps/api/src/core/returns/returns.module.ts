import { Module } from '@nestjs/common';
import { EXCHANGE_REQUESTS_REPOSITORY, RETURN_REQUESTS_REPOSITORY } from '@/common/interfaces';
import { ExchangeRequestsRepository } from './exchange-requests.repository';
import { ReturnRequestsRepository } from './return-requests.repository';

@Module({
  providers: [
    { provide: RETURN_REQUESTS_REPOSITORY, useClass: ReturnRequestsRepository },
    { provide: EXCHANGE_REQUESTS_REPOSITORY, useClass: ExchangeRequestsRepository },
  ],
  exports: [RETURN_REQUESTS_REPOSITORY, EXCHANGE_REQUESTS_REPOSITORY],
})
export class ReturnsModule {}
