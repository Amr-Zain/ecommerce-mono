import { Module } from '@nestjs/common';
import { CountriesModule } from './countries/countries.module';
import { CitiesModule } from './cities/cities.module';
import { SlidersModule } from './sliders/sliders.module';
import { FaqsModule } from './faqs/faqs.module';
import { CollectionsModule } from './collections/collections.module';
import { ProductsModule } from './products/products.module';
import { AttributesModule } from './attributes/attributes.module';
import { StaticPagesModule } from './static-pages/static-pages.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    CountriesModule,
    CitiesModule,
    SlidersModule,
    FaqsModule,
    CollectionsModule,
    ProductsModule,
    AttributesModule,
    StaticPagesModule,
    UsersModule,
    RolesModule,
    ReviewsModule,
  ],
  exports: [
    CountriesModule,
    CitiesModule,
    SlidersModule,
    FaqsModule,
    CollectionsModule,
    ProductsModule,
    AttributesModule,
    StaticPagesModule,
    UsersModule,
    RolesModule,
    ReviewsModule,
  ],
})
export class CoreModule {}
