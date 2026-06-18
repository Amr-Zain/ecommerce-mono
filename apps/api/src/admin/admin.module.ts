import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboard/dashboard.module';
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
import { ShowRoomsModule } from './show-rooms/show-rooms.module';
import { AdminOrdersModule } from './orders/admin-orders.module';
import { AdminCouponsModule } from './coupons/admin-coupons.module';
import { AdminReturnsModule } from './returns/admin-returns.module';
import { AdminWalletModule } from './wallet/admin-wallet.module';
import { MessageModule } from '@/shared/messages/message.module';
import { AdminTicketsModule } from './tickets/admin-tickets.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    DashboardModule,
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
    ShowRoomsModule,
    AdminOrdersModule,
    AdminCouponsModule,
    AdminReturnsModule,
    AdminWalletModule,
    MessageModule,
    AdminTicketsModule,

    RouterModule.register([
      {
        path: 'admin',
        children: [
          { path: '', module: DashboardModule },
          { path: '', module: CountriesModule },
          { path: '', module: CitiesModule },
          { path: '', module: SlidersModule },
          { path: '', module: FaqsModule },
          { path: '', module: CollectionsModule },
          { path: '', module: ProductsModule },
          { path: '', module: AttributesModule },
          { path: '', module: StaticPagesModule },
          { path: '', module: UsersModule },
          { path: '', module: RolesModule },
          { path: '', module: ReviewsModule },
          { path: '', module: ShowRoomsModule },
          { path: '', module: AdminOrdersModule },
          { path: '', module: AdminCouponsModule },
          { path: '', module: AdminReturnsModule },
          { path: '', module: AdminWalletModule },
          { path: '', module: MessageModule },
          { path: '', module: AdminTicketsModule },
        ],
      },
    ]),
  ],
})
export class AdminModule {}
