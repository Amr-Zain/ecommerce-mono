import { Module } from '@nestjs/common';
import { ClientWishlistController } from './client-wishlist.controller';
import { ClientWishlistService } from './client-wishlist.service';
import { AuthModule } from '@/auth/auth.module';
import { ClientWishlistRepository } from './client-wishlist.repository';

@Module({
  imports: [AuthModule],
  controllers: [ClientWishlistController],
  providers: [ClientWishlistService, ClientWishlistRepository],
  exports: [ClientWishlistService],
})
export class ClientWishlistModule {}
