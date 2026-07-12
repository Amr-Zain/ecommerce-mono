import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma';
import { DashboardPreferencesController } from './dashboard-preferences.controller';
import { DashboardPreferencesService } from './dashboard-preferences.service';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardPreferencesController],
  providers: [DashboardPreferencesService],
})
export class DashboardPreferencesModule {}
