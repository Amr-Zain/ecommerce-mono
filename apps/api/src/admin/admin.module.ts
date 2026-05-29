import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from './users/users.module';
import { CountriesModule } from './countries/countries.module';
import { CitiesModule } from './cities/cities.module';
import { SlidersModule } from './sliders/sliders.module';
import { FaqsModule } from './faqs/faqs.module';
import { StaticPagesModule } from './static-pages/static-pages.module';
import { RolesModule } from './roles/roles.module';
import { CollectionsModule } from './collections/collections.module';
import { AttributesModule } from './attributes/attributes.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    DashboardModule,
    UsersModule,
    RolesModule,
    CountriesModule,
    CitiesModule,
    SlidersModule,
    FaqsModule,
    StaticPagesModule,
    AttributesModule,
    ProductsModule,
    CollectionsModule,
    ReviewsModule,
    RouterModule.register([
      {
        path: 'admin',
        children: [
          { path: '', module: DashboardModule },
          { path: '', module: UsersModule },
          { path: '', module: RolesModule },
          { path: '', module: CountriesModule },
          { path: '', module: CitiesModule },
          { path: '', module: SlidersModule },
          { path: '', module: FaqsModule },
          { path: '', module: StaticPagesModule },
          { path: '', module: CollectionsModule },
          { path: '', module: AttributesModule },
          { path: '', module: ProductsModule },
          { path: '', module: ReviewsModule },
        ],
      },
    ]),
  ],
})
export class AdminModule {}
