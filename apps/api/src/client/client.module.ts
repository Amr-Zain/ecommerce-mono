import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { ClientHomeModule } from './home/client-home.module';
import { ClientCountriesModule } from './countries/client-countries.module';
import { ClientCitiesModule } from './cities/client-cities.module';
import { ClientSlidersModule } from './sliders/client-sliders.module';
import { ClientFaqsModule } from './faqs/client-faqs.module';
import { ClientCollectionsModule } from './collections/client-collections.module';
import { ClientProductsModule } from './products/client-products.module';
import { ClientAttributesModule } from './attributes/client-attributes.module';
import { ClientStaticPagesModule } from './static-pages/client-static-pages.module';
import { ClientAddressesModule } from './addresses/client-addresses.module';
import { ClientReviewsModule } from './reviews/client-reviews.module';
import { ClientOrdersModule } from './orders/client-orders.module';
import { ClientShowRoomsModule } from './show-rooms/client-show-rooms.module';
import { ClientCartModule } from './cart/client-cart.module';
import { ClientCheckoutModule } from './checkout/client-checkout.module';
import { ClientWishlistModule } from './wishlist/client-wishlist.module';
import { ClientReturnsModule } from './returns/client-returns.module';
import { ClientWalletModule } from './wallet/client-wallet.module';
import { ClientTicketsModule } from './tickets/client-tickets.module';
import { ClientLoyaltyModule } from './loyalty/client-loyalty.module';
import { RouterModule } from '@nestjs/core';
import { ClientSearchModule } from './search/client-search.module';

@Module({
  imports: [
    ClientHomeModule,
    ClientCountriesModule,
    ClientCitiesModule,
    ClientSlidersModule,
    ClientFaqsModule,
    ClientCollectionsModule,
    ClientProductsModule,
    ClientAttributesModule,
    ClientStaticPagesModule,
    ClientAddressesModule,
    ClientReviewsModule,
    ClientOrdersModule,
    ClientShowRoomsModule,
    ClientCartModule,
    ClientCheckoutModule,
    ClientWishlistModule,
    ClientReturnsModule,
    ClientWalletModule,
    ClientTicketsModule,
    ClientLoyaltyModule,
    ProfileModule,
    ClientSearchModule,

    RouterModule.register([
      {
        path: 'client',
        children: [
          { path: '', module: ClientHomeModule },
          { path: '', module: ClientCountriesModule },
          { path: '', module: ClientCitiesModule },
          { path: '', module: ClientSlidersModule },
          { path: '', module: ClientFaqsModule },
          { path: '', module: ClientCollectionsModule },
          { path: '', module: ClientProductsModule },
          { path: '', module: ClientAttributesModule },
          { path: '', module: ClientStaticPagesModule },
          { path: '', module: ClientAddressesModule },
          { path: '', module: ClientReviewsModule },
          { path: '', module: ClientOrdersModule },
          { path: '', module: ClientShowRoomsModule },
          { path: '', module: ClientCartModule },
          { path: '', module: ClientCheckoutModule },
          { path: '', module: ClientWishlistModule },
          { path: '', module: ClientReturnsModule },
          { path: '', module: ClientWalletModule },
          { path: '', module: ClientTicketsModule },
          { path: '', module: ClientLoyaltyModule },
          { path: '', module: ProfileModule },
          { path: '', module: ClientSearchModule },
        ],
      },
    ]),
  ],
})
export class ClientModule {}
