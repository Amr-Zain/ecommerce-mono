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
    ProfileModule,
  ],
})
export class ClientModule {}