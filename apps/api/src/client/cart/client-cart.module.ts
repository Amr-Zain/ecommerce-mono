import { Module } from '@nestjs/common';
import { ClientCartController } from './client-cart.controller';
import { ClientCartService } from './client-cart.service';
import { ClientCartRepository } from './client-cart.repository';
import { CartsModule } from '@/core/carts/carts.module';
import { ProductsModule } from '@/core/products/products.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [CartsModule, ProductsModule, AuthModule],
  controllers: [ClientCartController],
  providers: [ClientCartService, ClientCartRepository],
  exports: [ClientCartService],
})
export class ClientCartModule {}
