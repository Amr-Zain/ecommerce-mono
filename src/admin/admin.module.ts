import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from '../users/users.module';
import { CountriesModule } from './countries/countries.module';
import { CitiesModule } from './cities/cities.module';
import { SlidersModule } from './sliders/sliders.module';
import { FaqsModule } from './faqs/faqs.module';
import { StaticPagesModule } from './static-pages/static-pages.module';

@Module({
  imports: [
    DashboardModule,
    UsersModule,
    CountriesModule,
    CitiesModule,
    SlidersModule,
    FaqsModule,
    StaticPagesModule,
    RouterModule.register([
      {
        path: 'admin',
        children: [
          { path: '', module: DashboardModule },
          { path: '', module: UsersModule },
          { path: '', module: CountriesModule },
          { path: '', module: CitiesModule },
          { path: '', module: SlidersModule },
          { path: '', module: FaqsModule },
          { path: '', module: StaticPagesModule },
        ],
      },
    ]),
  ],
})
export class AdminModule {}
