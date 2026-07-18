import { Injectable } from '@nestjs/common';
import { DashboardHomeQueryDto, DashboardSection } from './dto/dashboard-home-query.dto';
import { DashboardExportQueryDto } from './dto/dashboard-export-query.dto';
import { DashboardQueryHandler } from './dashboard-query.handler';
import { DashboardExportService } from './dashboard-export.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly queries: DashboardQueryHandler,
    private readonly exports: DashboardExportService,
  ) {}

  getHome(query: DashboardHomeQueryDto = {}, langId = 'en') {
    return this.queries.getHome(query, langId);
  }

  getSection(section: DashboardSection, query: DashboardHomeQueryDto = {}, langId = 'en') {
    return this.queries.getSection(section, query, langId);
  }

  export(query: DashboardExportQueryDto = {}, langId = 'en') {
    return this.exports.export(query, langId);
  }
}
