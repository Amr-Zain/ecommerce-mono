import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { DashboardHomeQueryDto } from './dashboard-home-query.dto';

export const DASHBOARD_EXPORT_DATASETS = [
  'all',
  'overview',
  'sales',
  'customers',
  'inventory',
  'reviews',
  'loyalty',
  'geo',
] as const;

export type DashboardExportDataset = (typeof DASHBOARD_EXPORT_DATASETS)[number];

export class DashboardExportQueryDto extends DashboardHomeQueryDto {
  @IsOptional()
  @IsIn(DASHBOARD_EXPORT_DATASETS)
  @ApiPropertyOptional({ enum: DASHBOARD_EXPORT_DATASETS, default: 'overview' })
  dataset?: DashboardExportDataset = 'overview';

  @IsOptional()
  @IsIn(['csv'])
  @ApiPropertyOptional({ enum: ['csv'], default: 'csv' })
  format? = 'csv' as const;
}
