import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from '../users/users.module';
import { CountriesModule } from './countries/countries.module';
import { CitiesModule } from './cities/cities.module';

@Module({
  imports: [
    DashboardModule,
    UsersModule,
    CountriesModule,
    CitiesModule,
    RouterModule.register([
      {
        path: 'admin',
        children: [
          { path: '', module: DashboardModule },
          { path: '', module: UsersModule },
          { path: '', module: CountriesModule },
          { path: '', module: CitiesModule },
        ],
      },
    ]),
  ],
})
export class AdminModule {}
