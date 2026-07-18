import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { DASHBOARD_SECTIONS, DashboardSection } from './dashboard-home-query.dto';

export class DashboardSectionParamDto {
  @IsIn(DASHBOARD_SECTIONS)
  @ApiProperty({ enum: DASHBOARD_SECTIONS })
  section!: DashboardSection;
}
