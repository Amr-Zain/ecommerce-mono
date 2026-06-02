import { Module } from '@nestjs/common';
import { ClientCheckoutController } from './client-checkout.controller';
import { ClientCheckoutService } from './client-checkout.service';
import { CartsModule } from '@/core/carts/carts.module';
import { ProductsModule } from '@/core/products/products.module';
import { PaymentModule } from '@/shared/payment/payment.module';
import { ClientCartModule } from '../cart/client-cart.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    CartsModule,
    ProductsModule,
    PaymentModule,
    ClientCartModule,
  ],
  controllers: [ClientCheckoutController],
  providers: [ClientCheckoutService],
})
export class ClientCheckoutModule {}
