import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { DashboardPreferencesService } from './dashboard-preferences.service';
import { UpdateDashboardPreferencesDto } from './dto/update-dashboard-preferences.dto';

@ApiContext('admin')
@ApiTags('Admin - Dashboard Preferences')
@ApiBearerAuth('access-token')
@Controller('profile/dashboard-preferences')
export class DashboardPreferencesController {
  constructor(private readonly preferences: DashboardPreferencesService) {}

  @Get()
  get(@CurrentUser() user: { id: bigint }) {
    return this.preferences.get(user.id);
  }

  @Put()
  update(@CurrentUser() user: { id: bigint }, @Body() dto: UpdateDashboardPreferencesDto) {
    return this.preferences.update(user.id, dto);
  }
}
