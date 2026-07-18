import { Module } from '@nestjs/common';
import { ClientCheckoutController } from './client-checkout.controller';
import { ClientCheckoutService } from './client-checkout.service';
import { ClientCheckoutRepository } from './client-checkout.repository';
import { CartsModule } from '@/core/carts/carts.module';
import { ProductsModule } from '@/core/products/products.module';
import { PaymentModule } from '@/shared/payment/payment.module';
import { WalletModule } from '@/shared/wallet/wallet.module';
import { LoyaltyModule } from '@/shared/loyalty/loyalty.module';
import { ClientCartModule } from '../cart/client-cart.module';

@Module({
  imports: [CartsModule, ProductsModule, PaymentModule, WalletModule, LoyaltyModule, ClientCartModule],
  controllers: [ClientCheckoutController],
  providers: [ClientCheckoutService, ClientCheckoutRepository],
})
export class ClientCheckoutModule {}
