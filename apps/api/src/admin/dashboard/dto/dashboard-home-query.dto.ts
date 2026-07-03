import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const DASHBOARD_SECTIONS = [
  'overview',
  'sales',
  'customers',
  'inventory',
  'reviews',
  'loyalty',
  'geo',
  'recent',
  'charts',
] as const;

export type DashboardSection = (typeof DASHBOARD_SECTIONS)[number];

export class DashboardHomeQueryDto {
  @IsOptional()
  @IsIn(['today', '7d', '30d', '90d', 'year', 'custom'])
  @ApiPropertyOptional({ enum: ['today', '7d', '30d', '90d', 'year', 'custom'], default: '30d' })
  preset?: 'today' | '7d' | '30d' | '90d' | 'year' | 'custom' = '30d';

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2026-07-01' })
  from?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2026-07-31' })
  to?: string;

  @IsOptional()
  @IsIn(['auto', 'day', 'week', 'month'])
  @ApiPropertyOptional({ enum: ['auto', 'day', 'week', 'month'], default: 'auto' })
  granularity?: 'auto' | 'day' | 'week' | 'month' = 'auto';

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @ApiPropertyOptional({ default: true })
  compare?: boolean = true;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'overview,sales,charts' })
  sections?: string;
}
