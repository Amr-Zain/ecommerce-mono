import { Controller, Get, Param, Res } from '@nestjs/common';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiProduces } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { Response } from 'express';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardHomeQueryDto } from './dto/dashboard-home-query.dto';
import { DashboardExportQueryDto } from './dto/dashboard-export-query.dto';
import { DashboardSectionParamDto } from './dto/dashboard-section-param.dto';

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

  @Get('sections/:section')
  @RequirePermissions({ resource: 'dashboard', action: 'read' })
  getSection(
    @Param() params: DashboardSectionParamDto,
    @ParsedQuery(DashboardHomeQueryDto) query: DashboardHomeQueryDto,
    @I18nLang() lang: string,
  ) {
    return this.dashboardService.getSection(params.section, query, lang);
  }

  @Get('export')
  @RequirePermissions({ resource: 'dashboard', action: 'read' })
  @ApiProduces('text/csv')
  @ApiOkResponse({ description: 'Filtered dashboard dataset as a UTF-8 CSV file.' })
  async exportStats(
    @ParsedQuery(DashboardExportQueryDto) query: DashboardExportQueryDto,
    @I18nLang() lang: string,
    @Res() response: Response,
  ) {
    const file = await this.dashboardService.export(query, lang);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return response.send(Buffer.from(file.content, 'utf8'));
  }
}
