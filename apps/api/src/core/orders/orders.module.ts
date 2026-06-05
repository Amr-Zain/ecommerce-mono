import { Module } from '@nestjs/common';
import { ORDERS_REPOSITORY } from '@/common/interfaces/orders.interface';
import { OrdersRepository } from './orders.repository';

@Module({
  providers: [{ provide: ORDERS_REPOSITORY, useClass: OrdersRepository }],
  exports: [ORDERS_REPOSITORY],
})
export class OrdersModule {}
