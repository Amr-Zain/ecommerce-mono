import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardQueryHandler } from './dashboard-query.handler';
import { DashboardExportService } from './dashboard-export.service';
import {
  DASHBOARD_ANALYTICS_QUERIES,
  DASHBOARD_CATALOG_QUERIES,
  DASHBOARD_CUSTOMER_QUERIES,
  DASHBOARD_GEO_ACTIVITY_QUERIES,
  DASHBOARD_SALES_QUERIES,
} from './dashboard-query.port';
import { DashboardAnalyticsQueryRepository } from './dashboard-analytics-query.repository';
import { DashboardCatalogQueryRepository } from './dashboard-catalog-query.repository';
import { DashboardCustomerQueryRepository } from './dashboard-customer-query.repository';
import { DashboardGeoActivityQueryRepository } from './dashboard-geo-activity-query.repository';
import { DashboardSalesQueryRepository } from './dashboard-sales-query.repository';

@Module({
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardQueryHandler,
    DashboardExportService,
    { provide: DASHBOARD_CUSTOMER_QUERIES, useClass: DashboardCustomerQueryRepository },
    { provide: DASHBOARD_SALES_QUERIES, useClass: DashboardSalesQueryRepository },
    { provide: DASHBOARD_CATALOG_QUERIES, useClass: DashboardCatalogQueryRepository },
    { provide: DASHBOARD_GEO_ACTIVITY_QUERIES, useClass: DashboardGeoActivityQueryRepository },
    { provide: DASHBOARD_ANALYTICS_QUERIES, useClass: DashboardAnalyticsQueryRepository },
  ],
})
export class DashboardModule {}
