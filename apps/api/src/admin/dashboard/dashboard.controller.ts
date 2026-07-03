import { Controller, Get } from '@nestjs/common';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardHomeQueryDto } from './dto/dashboard-home-query.dto';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('home')
  @RequirePermissions({ resource: 'dashboard', action: 'read' })
  getStats(@ParsedQuery(DashboardHomeQueryDto) query: DashboardHomeQueryDto, @I18nLang() lang: string) {
    return this.dashboardService.getHome(query, lang);
  }
}
