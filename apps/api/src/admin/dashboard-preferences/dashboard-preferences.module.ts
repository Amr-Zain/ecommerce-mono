import { Module } from '@nestjs/common';
import { UsersModule } from '@/core/users/users.module';
import { DashboardPreferencesController } from './dashboard-preferences.controller';
import { DashboardPreferencesService } from './dashboard-preferences.service';

@Module({
  imports: [UsersModule],
  controllers: [DashboardPreferencesController],
  providers: [DashboardPreferencesService],
})
export class DashboardPreferencesModule {}
