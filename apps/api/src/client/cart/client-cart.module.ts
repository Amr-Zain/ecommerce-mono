import { Module } from '@nestjs/common';
import { ClientCartController } from './client-cart.controller';
import { ClientCartService } from './client-cart.service';
import { CartsModule } from '@/core/carts/carts.module';
import { ProductsModule } from '@/core/products/products.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule, CartsModule, ProductsModule],
  controllers: [ClientCartController],
  providers: [ClientCartService],
  exports: [ClientCartService],
})
export class ClientCartModule {}
