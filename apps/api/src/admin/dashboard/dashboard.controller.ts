import { Controller, Get } from '@nestjs/common';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  @Get('home')
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
