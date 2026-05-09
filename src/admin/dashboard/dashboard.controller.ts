import { Controller, Get } from '@nestjs/common';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@Controller('dashboard')
export class DashboardController {
  @Get('stats')
  @RequirePermissions({ resource: 'dashboard', action: 'read' })
  getStats() {
    return {
      totalUsers: 100,
      totalOrders: 250,
      totalProducts: 50,
      revenue: 15000,
    };
  }
}
