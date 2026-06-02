import { Module } from '@nestjs/common';
import { ClientProductsController } from './client-products.controller';
import { ClientProductsService } from './client-products.service';
import { ProductsModule as CoreProductsModule } from '@/core/products/products.module';
import { AuthModule } from '@/auth/auth.module';
import { ClientWishlistModule } from '../wishlist/client-wishlist.module';

@Module({
  imports: [CoreProductsModule, AuthModule, ClientWishlistModule],
  controllers: [ClientProductsController],
  providers: [ClientProductsService],
})
export class ClientProductsModule {}
