import { Module } from '@nestjs/common';
import { ClientHomeController } from './client-home.controller';
import { ClientHomeService } from './client-home.service';
import { SlidersModule as CoreSlidersModule } from '@/core/sliders/sliders.module';
import { CollectionsModule as CoreCollectionsModule } from '@/core/collections/collections.module';
import { ProductsModule as CoreProductsModule } from '@/core/products/products.module';
import { AuthModule } from '@/auth/auth.module';
import { ClientWishlistModule } from '../wishlist/client-wishlist.module';

@Module({
  imports: [CoreSlidersModule, CoreCollectionsModule, CoreProductsModule, AuthModule, ClientWishlistModule],
  controllers: [ClientHomeController],
  providers: [ClientHomeService],
})
export class ClientHomeModule {}
