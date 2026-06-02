import { Module } from '@nestjs/common';
import { ClientWishlistController } from './client-wishlist.controller';
import { ClientWishlistService } from './client-wishlist.service';

@Module({
  controllers: [ClientWishlistController],
  providers: [ClientWishlistService],
  exports: [ClientWishlistService],
})
export class ClientWishlistModule {}
